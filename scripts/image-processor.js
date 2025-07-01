/**
 * 图片处理器类
 * 负责图片的加载、变换、格式转换、水印处理等功能
 */
class ImageProcessor {
    constructor(canvas) {
        this.canvas = canvas || document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.currentImage = null;
        this.transforms = {
            rotation: 0,
            flipH: false,
            flipV: false
        };
    }

    /**
     * 加载图片
     * @param {File|string} source - 图片文件或URL
     * @returns {Promise<HTMLImageElement>}
     */
    async loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                this.resetTransforms();
                resolve(img);
            };

            img.onerror = () => {
                reject(new Error(window.TEXT_CONFIG.IMAGE_LOAD_FAILED));
            };

            if (source instanceof File) {
                img.src = URL.createObjectURL(source);
            } else if (typeof source === 'string') {
                img.src = source;
            } else {
                reject(new Error(window.TEXT_CONFIG.UNSUPPORTED_IMAGE_TYPE));
            }
        });
    }

    /**
     * 重置变换状态
     */
    resetTransforms() {
        this.transforms = {
            rotation: 0,
            flipH: false,
            flipV: false
        };
    }

    /**
     * 应用所有变换并渲染到canvas
     */
    applyTransforms() {
        if (!this.originalImage) return;

        const { width, height } = this.calculateDimensions();

        this.canvas.width = width;
        this.canvas.height = height;

        this.ctx.clearRect(0, 0, width, height);
        this.ctx.save();

        // 移动到中心点
        this.ctx.translate(width / 2, height / 2);

        // 应用旋转
        this.ctx.rotate((this.transforms.rotation * Math.PI) / 180);

        // 应用翻转
        this.ctx.scale(
            this.transforms.flipH ? -1 : 1,
            this.transforms.flipV ? -1 : 1
        );

        // 绘制图片
        this.ctx.drawImage(
            this.originalImage,
            -this.originalImage.width / 2,
            -this.originalImage.height / 2
        );

        this.ctx.restore();
    }

    /**
     * 计算变换后的尺寸
     */
    calculateDimensions() {
        if (!this.originalImage) return { width: 0, height: 0 };

        const { width: originalWidth, height: originalHeight } = this.originalImage;
        const rotation = Math.abs(this.transforms.rotation % 180);

        if (rotation === 90) {
            return {
                width: originalHeight,
                height: originalWidth
            };
        }

        return {
            width: originalWidth,
            height: originalHeight
        };
    }

    /**
     * 旋转图片
     * @param {number} angle - 旋转角度
     */
    rotate(angle) {
        this.transforms.rotation = (this.transforms.rotation + angle) % 360;
        this.applyTransforms();
    }

    /**
     * 翻转图片
     * @param {'horizontal'|'vertical'} direction - 翻转方向
     */
    flip(direction) {
        if (direction === 'horizontal') {
            this.transforms.flipH = !this.transforms.flipH;
        } else if (direction === 'vertical') {
            this.transforms.flipV = !this.transforms.flipV;
        }
        this.applyTransforms();
    }

    /**
     * 重置到原始状态
     */
    reset() {
        this.resetTransforms();
        this.applyTransforms();
    }

    /**
     * 转换图片格式
     * @param {string} format - 目标格式 (jpeg, png, webp, bmp)
     * @param {number} quality - 质量 (0-1)
     * @returns {Promise<Blob>}
     */
    async convertFormat(format, quality = 0.9) {
        if (!this.canvas) {
            throw new Error(window.TEXT_CONFIG.CANVAS_NOT_INITIALIZED);
        }

        // 确保canvas有内容
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.applyTransforms();
        }

        const mimeType = this.getMimeType(format);

        return new Promise((resolve, reject) => {
            this.canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error(window.TEXT_CONFIG.FORMAT_CONVERT_FAILED));
                    }
                },
                mimeType,
                quality
            );
        });
    }

    /**
     * 获取MIME类型
     * @param {string} format - 格式名称
     * @returns {string}
     */
    getMimeType(format) {
        const mimeTypes = {
            'jpeg': 'image/jpeg',
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'bmp': 'image/bmp'
        };
        return mimeTypes[format.toLowerCase()] || 'image/jpeg';
    }

    /**
     * 添加文字水印
     * @param {string} text - 水印文字
     * @param {Object} options - 水印选项
     */
    addTextWatermark(text, options = {}) {
        if (!this.canvas || !text) return;

        const {
            position = 'center',
            fontSize = 24,
            fontFamily = 'Arial',
            color = '#ff8200',
            opacity = 0.8,
            padding = 0
        } = options;

        this.ctx.save();

        // 设置字体样式
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = opacity;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // 添加文字描边以提高可读性
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;

        // 计算位置
        const { x, y } = this.calculateWatermarkPosition(position, text, fontSize, padding);

        // 绘制水印
        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);

        this.ctx.restore();
    }

    /**
     * 添加图片水印
     * @param {HTMLImageElement} watermarkImage - 水印图片
     * @param {Object} options - 水印选项
     */
    addImageWatermark(watermarkImage, options = {}) {
        if (!this.canvas || !watermarkImage) return;

        const {
            position = 'center',
            opacity = 0.8,
            scale = 0.2,
            padding = 20
        } = options;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        // 计算水印尺寸
        const watermarkWidth = watermarkImage.width * scale;
        const watermarkHeight = watermarkImage.height * scale;

        // 计算位置
        const { x, y } = this.calculateWatermarkPosition(
            position,
            null,
            0,
            padding,
            watermarkWidth,
            watermarkHeight
        );

        // 绘制水印图片
        this.ctx.drawImage(
            watermarkImage,
            x - watermarkWidth / 2,
            y - watermarkHeight / 2,
            watermarkWidth,
            watermarkHeight
        );

        this.ctx.restore();
    }

    /**
     * 计算水印位置
     * @param {string} position - 位置标识
     * @param {string} text - 文字内容（用于计算文字尺寸）
     * @param {number} fontSize - 字体大小
     * @param {number} padding - 边距
     * @param {number} width - 水印宽度（图片水印用）
     * @param {number} height - 水印高度（图片水印用）
     * @returns {Object} 位置坐标
     */
    calculateWatermarkPosition(position, text, fontSize, padding, width, height) {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // 如果是文字水印，计算文字尺寸
        if (text) {
            const metrics = this.ctx.measureText(text);
            width = metrics.width;
            height = fontSize;
        }

        const positions = {
            'top-left': {
                x: padding + width / 2,
                y: padding + height / 2
            },
            'top-center': {
                x: canvasWidth / 2,
                y: padding + height / 2
            },
            'top-right': {
                x: canvasWidth - padding - width / 2,
                y: padding + height / 2
            },
            'middle-left': {
                x: padding + width / 2,
                y: canvasHeight / 2
            },
            'center': {
                x: canvasWidth / 2,
                y: canvasHeight / 2
            },
            'middle-right': {
                x: canvasWidth - padding - width / 2,
                y: canvasHeight / 2
            },
            'bottom-left': {
                x: padding + width / 2,
                y: canvasHeight - padding - height / 2
            },
            'bottom-center': {
                x: canvasWidth / 2,
                y: canvasHeight - padding - height / 2
            },
            'bottom-right': {
                x: canvasWidth - padding - width / 2,
                y: canvasHeight - padding - height / 2
            }
        };

        return positions[position] || positions['center'];
    }

    /**
     * 导出为Blob
     * @param {string} format - 格式
     * @param {number} quality - 质量
     * @returns {Promise<Blob>}
     */
    toBlob(format = 'jpeg', quality = 0.9) {
        return this.convertFormat(format, quality);
    }

    /**
     * 导出为DataURL
     * @param {string} format - 格式
     * @param {number} quality - 质量
     * @returns {string}
     */
    toDataURL(format = 'jpeg', quality = 0.9) {
        const mimeType = this.getMimeType(format);
        return this.canvas.toDataURL(mimeType, quality);
    }

    /**
     * 获取图片信息
     * @returns {Object}
     */
    getImageInfo() {
        if (!this.originalImage) return null;

        return {
            originalWidth: this.originalImage.width,
            originalHeight: this.originalImage.height,
            currentWidth: this.canvas.width,
            currentHeight: this.canvas.height,
            transforms: { ...this.transforms }
        };
    }

    /**
     * 创建缩略图
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     * @returns {string} - DataURL
     */
    createThumbnail(maxWidth = 300, maxHeight = 300) {
        if (!this.originalImage) return null;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // 计算缩略图尺寸
        const { width, height } = this.calculateThumbnailSize(
            this.originalImage.width,
            this.originalImage.height,
            maxWidth,
            maxHeight
        );

        tempCanvas.width = width;
        tempCanvas.height = height;

        // 绘制缩略图
        tempCtx.drawImage(this.originalImage, 0, 0, width, height);

        return tempCanvas.toDataURL('image/jpeg', 0.8);
    }

    /**
     * 计算缩略图尺寸
     * @param {number} originalWidth - 原始宽度
     * @param {number} originalHeight - 原始高度
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     * @returns {Object} 缩略图尺寸
     */
    calculateThumbnailSize(originalWidth, originalHeight, maxWidth, maxHeight) {
        const aspectRatio = originalWidth / originalHeight;

        let width = maxWidth;
        let height = maxHeight;

        if (originalWidth > originalHeight) {
            height = width / aspectRatio;
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
        } else {
            width = height * aspectRatio;
            if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
            }
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * 销毁资源
     */
    destroy() {
        if (this.originalImage && this.originalImage.src.startsWith('blob:')) {
            URL.revokeObjectURL(this.originalImage.src);
        }

        this.originalImage = null;
        this.currentImage = null;
        this.canvas = null;
        this.ctx = null;
    }
}

// 导出类
window.ImageProcessor = ImageProcessor;
