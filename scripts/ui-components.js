/**
 * UI组件类
 * 负责用户界面组件的创建和管理
 */
class UIComponents {
    /**
     * 创建模态窗口
     * @param {string} content - 模态窗口内容
     * @param {Object} options - 选项
     * @returns {HTMLElement} 模态窗口元素
     */
    static createModal(content, options = {}) {
        const {
            title = '模态窗口',
            className = '',
            closable = true,
            backdrop = true
        } = options;

        const modal = document.createElement('div');
        modal.className = `modal ${className}`;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    ${closable ? '<button class="modal-close">&times;</button>' : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // 添加事件监听
        if (closable) {
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }

        if (backdrop) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        }

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(modal);

        // 显示动画
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        return modal;
    }

    /**
     * 关闭模态窗口
     * @param {HTMLElement} modal - 模态窗口元素
     */
    static closeModal(modal = null) {
        const modalElement = modal || document.querySelector('.modal.show');
        if (modalElement) {
            modalElement.classList.remove('show');
            setTimeout(() => {
                if (modalElement.parentNode) {
                    modalElement.parentNode.removeChild(modalElement);
                }
            }, 200);
        }
    }

    /**
     * 创建图片网格项
     * @param {Object} imageInfo - 图片信息
     * @returns {HTMLElement} 图片项元素
     */
    static createImageGridItem(imageInfo) {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.dataset.imageId = imageInfo.id;
        item.draggable = true;

        // 创建缩略图URL
        const thumbnailUrl = this.createThumbnail(imageInfo);

        item.innerHTML = `
            <div class="image-header">
                <input type="checkbox" class="image-checkbox" ${imageInfo.selected ? 'checked' : ''}>
                <button class="image-delete" title="删除图片">×</button>
            </div>
            <img class="image-preview" src="${thumbnailUrl}" alt="${imageInfo.name}" loading="lazy">
            <div class="image-info">
                <h4 title="${imageInfo.name}">${this.truncateText(imageInfo.name, 20)}</h4>
                <p>尺寸: ${imageInfo.width} × ${imageInfo.height}</p>
                <p>大小: ${FileHandler.formatFileSize(imageInfo.size)}</p>
                <p>格式: ${this.getFormatDisplay(imageInfo.type)}</p>
            </div>
        `;

        // 添加事件监听
        this.addImageItemEvents(item, imageInfo);

        return item;
    }

    /**
     * 为图片项添加事件监听
     * @param {HTMLElement} item - 图片项元素
     * @param {Object} imageInfo - 图片信息
     */
    static addImageItemEvents(item, imageInfo) {
        const checkbox = item.querySelector('.image-checkbox');
        const deleteBtn = item.querySelector('.image-delete');
        const preview = item.querySelector('.image-preview');

        // 复选框事件
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            this.dispatchCustomEvent('imageSelect', {
                imageId: imageInfo.id,
                selected: e.target.checked
            });
        });

        // 删除按钮事件
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete([imageInfo.id]);
        });

        // 点击图片项选中/取消选中（除了预览图片）
        item.addEventListener('click', (e) => {
            if (e.target === preview) return; // 点击预览图片时不触发选中

            checkbox.checked = !checkbox.checked;
            this.dispatchCustomEvent('imageSelect', {
                imageId: imageInfo.id,
                selected: checkbox.checked
            });
        });

        // 双击预览图片
        preview.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dispatchCustomEvent('imagePreview', { imageId: imageInfo.id });
        });

        // 拖拽事件
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', imageInfo.id);
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });

        // 拖拽排序
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.image-item.dragging');
            if (draggingItem && draggingItem !== item) {
                const rect = item.getBoundingClientRect();
                const midX = rect.left + rect.width / 2;

                if (e.clientX < midX) {
                    item.parentNode.insertBefore(draggingItem, item);
                } else {
                    item.parentNode.insertBefore(draggingItem, item.nextSibling);
                }
            }
        });
    }

    /**
     * 更新图片网格
     * @param {Array} images - 图片数组
     * @param {HTMLElement} container - 容器元素
     */
    static updateImageGrid(images, container) {
        if (!container) return;

        // 清空现有内容
        container.innerHTML = '';

        // 添加图片项
        images.forEach(imageInfo => {
            const item = this.createImageGridItem(imageInfo);
            container.appendChild(item);
        });

        // 更新图片计数
        this.updateImageCount(images.length);
    }

    /**
     * 创建缩略图
     * @param {Object} imageInfo - 图片信息
     * @returns {string} 缩略图URL
     */
    static createThumbnail(imageInfo) {
        // 如果图片较小，直接使用原图
        if (imageInfo.size < 1024 * 1024) { // 1MB以下
            return imageInfo.url;
        }

        // 创建canvas进行压缩
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const maxSize = 300;
            const { width, height } = this.calculateThumbnailSize(
                img.width,
                img.height,
                maxSize
            );

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
        };

        img.src = imageInfo.url;

        // 先返回原图URL，等canvas处理完成后替换
        return imageInfo.url;
    }

    /**
     * 计算缩略图尺寸
     * @param {number} originalWidth - 原始宽度
     * @param {number} originalHeight - 原始高度
     * @param {number} maxSize - 最大尺寸
     * @returns {Object} 缩略图尺寸
     */
    static calculateThumbnailSize(originalWidth, originalHeight, maxSize) {
        const aspectRatio = originalWidth / originalHeight;

        let width = maxSize;
        let height = maxSize;

        if (aspectRatio > 1) {
            height = width / aspectRatio;
        } else {
            width = height * aspectRatio;
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * 创建工具栏
     * @param {Object} options - 工具栏选项
     * @returns {HTMLElement} 工具栏元素
     */
    static createToolbar(options = {}) {
        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        toolbar.style.display = 'none';

        toolbar.innerHTML = `
            <div class="toolbar-left">
                <button class="btn btn-secondary" id="selectAllBtn">全选</button>
                <button class="btn btn-danger" id="deleteBtn" disabled>删除</button>
                <span class="separator">|</span>
                <button class="btn btn-secondary" id="rotateLeftBtn" disabled>↶ 左转</button>
                <button class="btn btn-secondary" id="rotateRightBtn" disabled>↷ 右转</button>
                <button class="btn btn-secondary" id="flipHBtn" disabled>⇄ 水平翻转</button>
                <button class="btn btn-secondary" id="flipVBtn" disabled>⇅ 垂直翻转</button>
                <button class="btn btn-secondary" id="resetBtn" disabled>↺ 重置</button>
            </div>
            <div class="toolbar-right">
                <button class="btn btn-success" id="downloadBtn" disabled>📥 下载</button>
            </div>
        `;

        return toolbar;
    }

    /**
     * 更新工具栏状态
     * @param {Object} state - 状态信息
     */
    static updateToolbar(state) {
        const { selectedCount, totalCount } = state;

        // 更新按钮状态
        const hasSelection = selectedCount > 0;
        const hasImages = totalCount > 0;

        document.getElementById('deleteBtn').disabled = !hasSelection;
        document.getElementById('rotateLeftBtn').disabled = !hasSelection;
        document.getElementById('rotateRightBtn').disabled = !hasSelection;
        document.getElementById('flipHBtn').disabled = !hasSelection;
        document.getElementById('flipVBtn').disabled = !hasSelection;
        document.getElementById('resetBtn').disabled = !hasSelection;
        document.getElementById('downloadBtn').disabled = !hasImages;

        // 更新全选按钮文本
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectedCount === totalCount && totalCount > 0) {
            selectAllBtn.textContent = '取消全选';
        } else {
            selectAllBtn.textContent = '全选';
        }
    }

    /**
     * 显示进度条
     * @param {number} progress - 进度 (0-100)
     * @param {string} text - 进度文本
     */
    static showProgress(progress, text = '') {
        let overlay = document.getElementById('progressOverlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'progressOverlay';
            overlay.className = 'progress-overlay';
            overlay.innerHTML = `
                <div class="progress-modal">
                    <h3>处理中...</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <p id="progressText">正在处理...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        overlay.classList.add('show');

        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressFill.style.width = `${progress}%`;
        progressText.textContent = text || `进度: ${progress}%`;
    }

    /**
     * 隐藏进度条
     */
    static hideProgress() {
        const overlay = document.getElementById('progressOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    /**
     * 更新图片计数
     * @param {number} count - 图片数量
     */
    static updateImageCount(count) {
        const imageCountElement = document.getElementById('imageCount');
        if (imageCountElement) {
            imageCountElement.textContent = `${count} 张图片`;
        }
    }

    /**
     * 更新选中计数
     * @param {number} selectedCount - 选中数量
     * @param {number} totalCount - 总数量
     */
    static updateSelectedCount(selectedCount, totalCount) {
        const selectedCountElement = document.getElementById('selectedCount');
        if (selectedCountElement) {
            if (selectedCount === 0) {
                selectedCountElement.textContent = '未选择图片';
            } else {
                selectedCountElement.textContent = `已选择 ${selectedCount}/${totalCount} 张图片`;
            }
        }
    }

    /**
     * 确认删除对话框
     * @param {Array} imageIds - 要删除的图片ID数组
     */
    static confirmDelete(imageIds) {
        const count = imageIds.length;
        const message = count === 1 ? '确定要删除这张图片吗？' : `确定要删除这 ${count} 张图片吗？`;

        if (confirm(message)) {
            this.dispatchCustomEvent('imageDelete', { imageIds });
        }
    }

    /**
     * 截断文本
     * @param {string} text - 原始文本
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的文本
     */
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * 获取格式显示名称
     * @param {string} mimeType - MIME类型
     * @returns {string} 显示名称
     */
    static getFormatDisplay(mimeType) {
        const formatMap = {
            'image/jpeg': 'JPEG',
            'image/jpg': 'JPEG',
            'image/png': 'PNG',
            'image/gif': 'GIF',
            'image/webp': 'WEBP',
            'image/bmp': 'BMP'
        };
        return formatMap[mimeType] || mimeType.split('/')[1].toUpperCase();
    }

    /**
     * 创建拖拽指示器
     * @param {HTMLElement} container - 容器元素
     */
    static createDragIndicator(container) {
        const indicator = document.createElement('div');
        indicator.className = 'drag-indicator';
        indicator.textContent = '拖拽文件到此处';
        container.appendChild(indicator);
        return indicator;
    }

    /**
     * 显示拖拽指示器
     * @param {HTMLElement} indicator - 指示器元素
     */
    static showDragIndicator(indicator) {
        if (indicator) {
            indicator.classList.add('show');
        }
    }

    /**
     * 隐藏拖拽指示器
     * @param {HTMLElement} indicator - 指示器元素
     */
    static hideDragIndicator(indicator) {
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    /**
     * 触发自定义事件
     * @param {string} eventName - 事件名称
     * @param {Object} detail - 事件详情
     */
    static dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success, error, info, warning)
     */
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 导出类
window.UIComponents = UIComponents;
