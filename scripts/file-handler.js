/**
 * 文件处理器类
 * 负责文件的上传、验证、下载等操作
 */
class FileHandler {
    // 支持的图片格式
    static SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

    // 最大文件大小 (50MB)
    static MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * 处理文件选择
     * @param {FileList} files - 选择的文件列表
     * @returns {Promise<Array>} 处理后的文件信息数组
     */
    static async handleFileSelect(files) {
        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const validation = this.validateFile(file);
                if (validation.valid) {
                    const fileInfo = await this.getFileInfo(file);
                    results.push(fileInfo);
                } else {
                    throw new Error(validation.error);
                }
            } catch (error) {
                console.error(`文件 ${file.name} 处理失败:`, error.message);
                // 可以选择显示错误通知
                this.showError(`文件 ${file.name} 处理失败: ${error.message}`);
            }
        }

        return results;
    }

    /**
     * 处理拖拽文件
     * @param {DragEvent} event - 拖拽事件
     * @returns {Promise<Array>} 处理后的文件信息数组
     */
    static async handleFileDrop(event) {
        event.preventDefault();

        const items = event.dataTransfer.items;
        const files = [];

        // 处理拖拽的文件
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        return this.handleFileSelect(files);
    }

    /**
     * 验证文件
     * @param {File} file - 要验证的文件
     * @returns {Object} 验证结果
     */
    static validateFile(file) {
        // 检查文件类型
        if (!this.SUPPORTED_FORMATS.includes(file.type)) {
            return {
                valid: false,
                error: `不支持的文件格式: ${file.type}。支持的格式: JPG, PNG, GIF, WEBP, BMP`
            };
        }

        // 检查文件大小
        if (file.size > this.MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
            return {
                valid: false,
                error: `文件过大: ${sizeMB}MB。最大支持: ${maxSizeMB}MB`
            };
        }

        // 检查文件名
        if (!file.name || file.name.trim() === '') {
            return {
                valid: false,
                error: '文件名无效'
            };
        }

        return { valid: true };
    }

    /**
     * 获取文件信息
     * @param {File} file - 文件对象
     * @returns {Promise<Object>} 文件信息
     */
    static async getFileInfo(file) {
        const url = URL.createObjectURL(file);

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const fileInfo = {
                    id: this.generateId(),
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    width: img.width,
                    height: img.height,
                    url: url,

                    // 编辑状态
                    transforms: {
                        rotation: 0,
                        flipH: false,
                        flipV: false
                    },

                    // 水印设置
                    watermark: {
                        type: 'text',
                        content: '',
                        position: 'center',
                        opacity: 0.8,
                        style: {
                            fontSize: 24,
                            fontFamily: 'Arial',
                            color: '#ffffff'
                        }
                    },

                    // 导出设置
                    export: {
                        format: 'jpeg',
                        quality: 0.9
                    },

                    // 选中状态
                    selected: false,

                    // 创建时间
                    createdAt: new Date().getTime()
                };

                resolve(fileInfo);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('无法读取图片尺寸信息'));
            };

            img.src = url;
        });
    }

    /**
     * 生成唯一ID
     * @returns {string}
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 获取文件扩展名
     * @param {string} filename - 文件名
     * @returns {string} 扩展名
     */
    static getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * 下载单个文件
     * @param {Blob} blob - 文件数据
     * @param {string} filename - 文件名
     */
    static downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 延迟释放URL
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }

    /**
     * 批量下载文件（打包为ZIP）
     * @param {Array} files - 文件数组 [{blob, filename}, ...]
     * @param {string} zipName - ZIP文件名
     */
    static async downloadMultiple(files, zipName = 'images.zip') {
        if (!window.JSZip) {
            throw new Error('JSZip 库未加载');
        }

        const zip = new JSZip();

        // 添加文件到ZIP
        files.forEach(({ blob, filename }, index) => {
            // 确保文件名唯一
            const uniqueFilename = this.ensureUniqueFilename(zip, filename, index);
            zip.file(uniqueFilename, blob);
        });

        try {
            // 生成ZIP文件
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });

            // 下载ZIP文件
            this.downloadFile(zipBlob, zipName);
        } catch (error) {
            throw new Error('ZIP文件生成失败: ' + error.message);
        }
    }

    /**
     * 确保文件名唯一
     * @param {JSZip} zip - ZIP对象
     * @param {string} filename - 原始文件名
     * @param {number} index - 索引
     * @returns {string} 唯一文件名
     */
    static ensureUniqueFilename(zip, filename, index) {
        let uniqueFilename = filename;
        let counter = 1;

        // 如果文件名已存在，添加序号
        while (zip.files[uniqueFilename]) {
            const name = filename.substring(0, filename.lastIndexOf('.'));
            const ext = filename.substring(filename.lastIndexOf('.'));
            uniqueFilename = `${name}_${counter}${ext}`;
            counter++;
        }

        return uniqueFilename;
    }

    /**
     * 读取文件为DataURL
     * @param {File} file - 文件对象
     * @returns {Promise<string>} DataURL
     */
    static readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * 压缩图片
     * @param {File} file - 原始文件
     * @param {Object} options - 压缩选项
     * @returns {Promise<Blob>} 压缩后的图片
     */
    static async compressImage(file, options = {}) {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            format = 'jpeg'
        } = options;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                // 计算压缩后的尺寸
                const { width, height } = this.calculateCompressedSize(
                    img.width,
                    img.height,
                    maxWidth,
                    maxHeight
                );

                canvas.width = width;
                canvas.height = height;

                // 绘制压缩后的图片
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为Blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('图片压缩失败'));
                        }
                    },
                    `image/${format}`,
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 计算压缩后的尺寸
     * @param {number} originalWidth - 原始宽度
     * @param {number} originalHeight - 原始高度
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     * @returns {Object} 压缩后的尺寸
     */
    static calculateCompressedSize(originalWidth, originalHeight, maxWidth, maxHeight) {
        const aspectRatio = originalWidth / originalHeight;

        let width = originalWidth;
        let height = originalHeight;

        // 如果超出最大尺寸，进行等比缩放
        if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误信息
     */
    static showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(errorDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    /**
     * 显示成功信息
     * @param {string} message - 成功信息
     */
    static showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 2000);
    }
}

// 导出类
window.FileHandler = FileHandler;
