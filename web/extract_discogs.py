import re
import os

import json

html_path = 'discogs.html'
output_md_path = 'purchase_summary.md'
output_json_path = 'public/purchase_data.json'

def normalize_name(name):
    # Remove everything in the last set of parentheses if it contains format keywords
    # e.g., "Artist - Title (LP, Album, RE)" -> "Artist - Title"
    name = re.sub(r'\s*\([^)]*(?:LP|Album|CD|Single|RI|RE|RM|Ltd|Mono|Stereo|Promo|Pur|Styrene|Ter|Scr|Mono|Album|Mon)[^)]*\)$', '', name, flags=re.IGNORECASE)
    # Remove trailing asterisks and whitespace
    name = re.sub(r'[*]+$', '', name).strip()
    # Remove common Discogs numbering like Artist (4)
    name = re.sub(r'\s+\(\d+\)', '', name)
    # Final cleanup
    name = re.sub(r'\s+', ' ', name).strip().lower()
    return name

def extract_data():
    if not os.path.exists(html_path):
        print(f"Error: {html_path} not found")
        return []

    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Split by order containers
    order_chunks = html.split('<div class="order_container')[1:]
    orders = []

    for chunk in order_chunks:
        order_data = {}
        
        # Seller
        seller_match = re.search(r'data-seller="([^"]+)"', chunk)
        order_data['seller'] = seller_match.group(1) if seller_match else 'Unknown'
        
        # Subtotal Original
        subtotal_orig_match = re.search(r'data-subtotal="([^"]+)"', chunk)
        order_data['subtotal_orig'] = float(subtotal_orig_match.group(1) if subtotal_orig_match else 0)
        
        # Subtotal NZD
        # Looking for the pattern: <tr class="order_subtotal"> ... NZ$ ...
        subtotal_nzd_match = re.search(r'<tr class="order_subtotal">.*?NZ\$([\d.,]+)', chunk, re.DOTALL)
        order_data['subtotal_nzd'] = float(subtotal_nzd_match.group(1).replace(',', '') if subtotal_nzd_match else 0)
        
        # Shipping NZD
        shipping_nzd_match = re.search(r'order_shipping_amount.*?NZ\$([\d.,]+)', chunk, re.DOTALL)
        order_data['shipping_nzd'] = float(shipping_nzd_match.group(1).replace(',', '') if shipping_nzd_match else 0)

        # Total NZD
        total_nzd_match = re.search(r'<tr class="order_total with-price">.*?NZ\$([\d.,]+)', chunk, re.DOTALL)
        order_data['total_nzd'] = float(total_nzd_match.group(1).replace(',', '') if total_nzd_match else 0)

        # Exchange Rate
        order_data['rate'] = order_data['subtotal_nzd'] / order_data['subtotal_orig'] if order_data['subtotal_orig'] > 0 else 0

        # Items - split by item rows
        item_rows = re.split(r'<tr class="[^"]*order_row"', chunk)[1:]
        order_data['items'] = []
        for row in item_rows:
            name_match = re.search(r'<a class="item_link"[^>]*>(.*?)</a>', row, re.DOTALL)
            name = name_match.group(1).strip() if name_match else 'Unknown'
            # Clean up name (remove nested tags, extra whitespace)
            name = re.sub(r'<[^>]*>', '', name)
            name = re.sub(r'\s+', ' ', name).strip()
            # Clean up entities
            name = name.replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'")
            normalized_name = normalize_name(name)
            
            condition_match = re.search(r'title="Media Condition">.*?Media:.*?<span>\s*(.*?)\s*(?:<span|\n)', row, re.DOTALL)
            condition = condition_match.group(1).strip() if condition_match else 'Unknown'
            # Clean up condition (remove extra whitespace/newlines)
            condition = re.sub(r'\s+', ' ', condition).strip()
            
            price_match = re.search(r'data-price-value="([^"]+)"', row)
            price_orig = float(price_match.group(1) if price_match else 0)
            price_nzd = price_orig * order_data['rate']

            order_data['items'].append({
                'name': name,
                'normalized_name': normalized_name,
                'condition': condition,
                'price_orig': price_orig,
                'price_nzd': price_nzd
            })

        # Distribute shipping and tax
        num_items = len(order_data['items'])
        shipping_per_item = order_data['shipping_nzd'] / num_items if num_items > 0 else 0
        
        # Calculate tax factor (Total / (Subtotal + Shipping))
        # This accurately accounts for tax applied to both items and shipping
        tax_factor = order_data['total_nzd'] / (order_data['subtotal_nzd'] + order_data['shipping_nzd']) if (order_data['subtotal_nzd'] + order_data['shipping_nzd']) > 0 else 1
        
        for item in order_data['items']:
            item['shipping_inc_nzd'] = item['price_nzd'] + shipping_per_item
            item['total_inc_tax_ship_nzd'] = item['shipping_inc_nzd'] * tax_factor
            item['shipping_share_nzd'] = shipping_per_item

        orders.append(order_data)

    return orders

def generate_report(orders):
    # Collect all unique items and their prices by normalized name
    item_map = {}
    for order in orders:
        for item in order['items']:
            norm_name = item['normalized_name']
            if norm_name not in item_map:
                item_map[norm_name] = []
            item_map[norm_name].append({
                'seller': order['seller'],
                'name': item['name'],
                'condition': item['condition'],
                'price_nzd': item['price_nzd'],
                'shipping_inc_nzd': item['shipping_inc_nzd'],
                'total_inc_tax_ship_nzd': item['total_inc_tax_ship_nzd']
            })

    # Strategy logic
    recommendations = {} # norm_name -> {best: item, others: [items]}
    CLOSE_THRESHOLD = 3.00
    
    for norm_name, occurrences in item_map.items():
        # Sort by total price
        sorted_occ = sorted(occurrences, key=lambda x: x['total_inc_tax_ship_nzd'])
        best = sorted_occ[0]
        others = sorted_occ[1:]
        
        close_seconds = [o for o in others if (o['total_inc_tax_ship_nzd'] - best['total_inc_tax_ship_nzd']) <= CLOSE_THRESHOLD]
        
        recommendations[norm_name] = {
            'best': best,
            'close_seconds': close_seconds,
            'all': sorted_occ
        }

    md = '# Discogs Purchase Summary\n\n'
    
    # 1. Strategy Section
    md += "## 🎯 Optimized Purchase Strategy\n"
    md += f"Suggestions for the best items to buy from each seller to minimize your total cost (using a ${CLOSE_THRESHOLD:.2f} 'close' threshold).\n\n"
    
    # Group by best seller
    seller_recommendations = {}
    for norm_name, rec in recommendations.items():
        seller = rec['best']['seller']
        if seller not in seller_recommendations:
            seller_recommendations[seller] = []
        seller_recommendations[seller].append(rec)
    
    grand_optimized_total = 0
    
    # Sort sellers by number of best items
    for seller in sorted(seller_recommendations.keys(), key=lambda s: len(seller_recommendations[s]), reverse=True):
        recs = seller_recommendations[seller]
        seller_total = sum(r['best']['total_inc_tax_ship_nzd'] for r in recs)
        grand_optimized_total += seller_total
        
        md += f"### Buy from **{seller}** ({len(recs)} items)\n"
        md += f"- **Estimated Optimized Total**: NZ${seller_total:.2f}\n\n"
        md += "| Item | Price (Inc. Tax & Ship) | Comparison |\n"
        md += "| :--- | :--- | :--- |\n"
        for rec in recs:
            item = rec['best']
            comp_str = "✅ Cheapest"
            if rec['close_seconds']:
                others_str = ", ".join([f"{o['seller']} (+${o['total_inc_tax_ship_nzd'] - item['total_inc_tax_ship_nzd']:.2f})" for o in rec['close_seconds']])
                comp_str += f" (Close: {others_str})"
            md += f"| {item['name']} | ${item['total_inc_tax_ship_nzd']:.2f} | {comp_str} |\n"
        md += "\n"

    md += f"### 📊 Strategy Summary\n"
    md += f"- **Total items to purchase**: {len(recommendations)}\n"
    md += f"- **Grand Total (Optimized)**: **NZ${grand_optimized_total:.2f}**\n\n"

    # Mention "Close" items from other sellers that weren't the "Best"
    md += "### 💡 Alternatives (Close Prices)\n"
    md += "These items are not the absolute cheapest, but are within the threshold of the best price found.\n\n"
    md += "| Item | This Seller | Best Seller | Diff |\n"
    md += "| :--- | :--- | :--- | :--- |\n"
    for norm_name, rec in recommendations.items():
        best = rec['best']
        for second in rec['close_seconds']:
            diff = second['total_inc_tax_ship_nzd'] - best['total_inc_tax_ship_nzd']
            md += f"| {best['name']} | **{second['seller']}** (${second['total_inc_tax_ship_nzd']:.2f}) | {best['seller']} (${best['total_inc_tax_ship_nzd']:.2f}) | +${diff:.2f} |\n"
    
    md += "\n---\n\n"

    # 2. Original Orders Section
    md += "## All Orders Detail\n\n"
    for order in orders:
        md += f"### Order from {order['seller']}\n"
        md += f"- **Subtotal**: NZ${order['subtotal_nzd']:.2f}\n"
        md += f"- **Shipping**: NZ${order['shipping_nzd']:.2f}\n"
        md += f"- **Total**: NZ${order['total_nzd']:.2f}\n"
        md += f"\n| Item Name | Condition | Price (NZD) | Inc. Tax & Ship | Status |\n"
        md += f"| :--- | :--- | :--- | :--- | :--- |\n"
        
        for item in order['items']:
            rec = recommendations[item['normalized_name']]
            status = ""
            if rec['best']['seller'] == order['seller']:
                status = "✅ **Best Price**"
            elif any(s['seller'] == order['seller'] for s in rec['close_seconds']):
                diff = next(s['total_inc_tax_ship_nzd'] for s in rec['close_seconds'] if s['seller'] == order['seller']) - rec['best']['total_inc_tax_ship_nzd']
                status = f"⚠️ Close (+${diff:.2f})"
            else:
                diff = item['total_inc_tax_ship_nzd'] - rec['best']['total_inc_tax_ship_nzd']
                status = f"❌ Better at {rec['best']['seller']} (-${diff:.2f})"
            
            md += f"| {item['name']} | {item['condition']} | ${item['price_nzd']:.2f} | ${item['total_inc_tax_ship_nzd']:.2f} | {status} |\n"
        md += '\n'

    return md, recommendations

if __name__ == '__main__':
    orders_data = extract_data()
    if orders_data:
        # Save Markdown Report
        report_content, recommendations_data = generate_report(orders_data)
        with open(output_md_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        # Save JSON Data
        full_data = {
            "orders": orders_data,
            "recommendations": recommendations_data,
            "items_summary": {}
        }
        
        # Keep items_summary for backward compatibility
        for norm_name, rec in recommendations_data.items():
            full_data["items_summary"][norm_name] = rec['all']

        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(full_data, f, indent=4)
            
        print(f"Report generated at {output_md_path}")
        print(f"JSON data saved at {output_json_path}")
    else:
        print("No data extracted.")
