export class Canvas {

    resetActive() {
        document.querySelectorAll('.sticker').forEach((element) => {
            element.classList.remove('active');
        })
    }

    destroy() {
        this.handleDrop();
        this.canvasController.abort();
    }

    init() {
        this.canvasController = new AbortController();
        const {signal} = this.canvasController;

        window.addEventListener('mousedown', (e) => {
            e.preventDefault();

            this.targetSticker = e.target.closest(".sticker");
            if (this.targetSticker) {
                this.resetActive();
                this.targetSticker.classList.add('active');
                this.startDrag(e);
            } else {
                this.resetActive();
            }
        }, {signal})
    }

    startDrag(e) {
        this.dragController = new AbortController();
        const {signal} = this.dragController;

        const canvas = document.getElementById('canvas');
        this.canvasRect = canvas.getBoundingClientRect();

        const targetStickerRect = this.targetSticker.getBoundingClientRect();
        this.dragOffsetX = e.clientX - targetStickerRect.left;
        this.dragOffsetY = e.clientY - targetStickerRect.top;

        window.addEventListener('mousemove', (moveEvent) => {
            this.handleDrag(moveEvent);
        }, {signal});

        window.addEventListener('mouseup', (upEvent) => {
            this.handleDrop(upEvent);
        }, {signal})
    }

    handleDrag(moveEvent) {
        if (!this.targetSticker) return;

        this.pendingPosX = moveEvent.clientX - this.canvasRect.left - this.dragOffsetX;
        this.pendingPosY = moveEvent.clientY - this.canvasRect.top - this.dragOffsetY;

        if (this.rafId) return;

        this.rafId = requestAnimationFrame(() => {
            this.rafId = null
            this.targetSticker.style.transform = `translate(${this.pendingPosX}px, ${this.pendingPosY}px)`;
        })

    }

    handleDrop() {
        this.targetSticker = null;
        this.dragOffsetX = null;
        this.dragOffsetY = null;
        this.dragController.abort();
        this.rafId && cancelAnimationFrame(this.rafId);
    }
}