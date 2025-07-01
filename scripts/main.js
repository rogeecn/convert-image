/**
 * 主应用程序类
 * 负责整个应用的初始化和状态管理
 */
class ImageConverterApp {
    constructor() {
        this.images = []; // 存储所有图片信息
        this.selectedImages = new Set(); // 存储选中的图片ID
        this.watermarkSettings = {
            type: 'text',
            content: 'Sample Watermark',
            position: 'center',
            opacity: 0.8,
            style: {
                fontSize: 24,
                fontFamily: 'Arial',
                color: '#ff8200'
            },
            image: null,
            scale: 0.2
        };
        this.formatSettings = {
            format: 'jpeg',
            quality: 0.9
        };

        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.setupEventListeners();
        this.initializeUI();
        console.log(window.TEXT_CONFIG.APP_INITIALIZED);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 文件上传事件
        this.setupFileUploadEvents();

        // 工具栏事件
        this.setupToolbarEvents();

        // 自定义事件
        this.setupCustomEvents();

        // 侧边面板事件
        this.setupSidePanelEvents();

        // 键盘快捷键
        this.setupKeyboardEvents();

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.updateLayout();
        });
    }

    /**
     * 设置文件上传事件
     */
    setupFileUploadEvents() {
        const fileInput = document.getElementById('fileInput');
        const selectFilesBtn = document.getElementById('selectFilesBtn');
        const uploadArea = document.getElementById('uploadArea');

        // 点击选择文件
        selectFilesBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            fileInput.click();
        });

        // 点击上传区域
        uploadArea.addEventListener('click', (e) => {
            // 只有当点击的不是按钮时才触发
            if (e.target !== selectFilesBtn && !selectFilesBtn.contains(e.target)) {
                fileInput.click();
            }
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileDrop(e);
        });
    }

    /**
     * 设置工具栏事件
     */
    setupToolbarEvents() {
        // 全选/取消全选
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.toggleSelectAll();
        });

        // 删除选中
        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.deleteSelected();
        });

        // 图片变换
        document.getElementById('rotateLeftBtn').addEventListener('click', () => {
            this.rotateSelected(-90);
        });

        document.getElementById('rotateRightBtn').addEventListener('click', () => {
            this.rotateSelected(90);
        });

        document.getElementById('flipHBtn').addEventListener('click', () => {
            this.flipSelected('horizontal');
        });

        document.getElementById('flipVBtn').addEventListener('click', () => {
            this.flipSelected('vertical');
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSelected();
        });

        // 下载
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImages();
        });
    }

    /**
     * 设置自定义事件
     */
    setupCustomEvents() {
        // 图片选择事件
        document.addEventListener('imageSelect', (e) => {
            this.handleImageSelect(e.detail);
        });

        // 图片预览事件
        document.addEventListener('imagePreview', (e) => {
            this.previewImage(e.detail.imageId);
        });

        // 图片删除事件
        document.addEventListener('imageDelete', (e) => {
            this.deleteImages(e.detail.imageIds);
        });
    }

    /**
     * 设置侧边面板事件
     */
    setupSidePanelEvents() {
        // 格式转换
        const targetFormat = document.getElementById('targetFormat');
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');
        const convertBtn = document.getElementById('convertBtn');

        targetFormat.addEventListener('change', (e) => {
            this.formatSettings.format = e.target.value;
            this.updateQualityControlVisibility();
        });

        qualitySlider.addEventListener('input', (e) => {
            const quality = parseInt(e.target.value);
            qualityValue.textContent = quality;
            this.formatSettings.quality = quality / 100;
        });

        convertBtn.addEventListener('click', () => {
            this.convertSelectedFormat();
        });

        // 水印设置
        this.setupWatermarkEvents();
    }

    /**
     * 设置水印事件
     */
    setupWatermarkEvents() {
        // 水印类型切换
        const watermarkTypeRadios = document.querySelectorAll('input[name="watermarkType"]');
        watermarkTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.watermarkSettings.type = e.target.value;
                this.updateWatermarkControls();
            });
        });

        // 文字水印设置
        const watermarkText = document.getElementById('watermarkText');
        const fontSize = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        const fontColor = document.getElementById('fontColor');
        const watermarkOpacity = document.getElementById('watermarkOpacity');
        const opacityValue = document.getElementById('opacityValue');

        watermarkText.addEventListener('input', (e) => {
            this.watermarkSettings.content = e.target.value;
        });

        fontSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            fontSizeValue.textContent = size + 'px';
            this.watermarkSettings.style.fontSize = size;
        });

        fontColor.addEventListener('change', (e) => {
            this.watermarkSettings.style.color = e.target.value;
        });

        watermarkOpacity.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value);
            opacityValue.textContent = opacity + '%';
            this.watermarkSettings.opacity = opacity / 100;
        });

        // 图片水印设置
        const watermarkImageInput = document.getElementById('watermarkImageInput');
        const watermarkImageOpacity = document.getElementById('watermarkImageOpacity');
        const imageOpacityValue = document.getElementById('imageOpacityValue');

        watermarkImageInput.addEventListener('change', (e) => {
            this.handleWatermarkImageSelect(e.target.files[0]);
        });

        watermarkImageOpacity.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value);
            imageOpacityValue.textContent = opacity + '%';
            this.watermarkSettings.opacity = opacity / 100;
        });

        // 位置选择
        const positionBtns = document.querySelectorAll('.position-btn');
        positionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                positionBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.watermarkSettings.position = e.target.dataset.position;
            });
        });

        // 应用水印
        document.getElementById('applyWatermarkBtn').addEventListener('click', () => {
            this.applyWatermarkToSelected();
        });
    }

    /**
     * 设置键盘事件
     */
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // ESC关闭模态窗口
            if (e.key === 'Escape') {
                UIComponents.closeModal();
            }

            // Delete键删除选中图片
            if (e.key === 'Delete' && this.selectedImages.size > 0) {
                this.deleteSelected();
            }

            // Ctrl+A全选
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            }
        });
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        this.updateQualityControlVisibility();
        this.updateWatermarkControls();
        this.updateToolbarState();
    }

    /**
     * 处理文件选择
     */
    async handleFileSelect(files) {
        if (files.length === 0) return;

        UIComponents.showProgress(0, window.TEXT_CONFIG.FILE_PROCESSING);

        try {
            const newImages = await FileHandler.handleFileSelect(files);

            for (let i = 0; i < newImages.length; i++) {
                const progress = ((i + 1) / newImages.length) * 100;
                UIComponents.showProgress(progress, `处理文件 ${i + 1}/${newImages.length}`);

                this.images.push(newImages[i]);
                await new Promise(resolve => setTimeout(resolve, 50)); // 模拟处理时间
            }

            this.updateImageGrid();
            this.updateToolbarState();
            this.showToolbarIfNeeded();

            FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_ADD_IMAGES.replace('{count}', newImages.length));
        } catch (error) {
            console.error(window.TEXT_CONFIG.FILE_PROCESS_FAILED + ':', error);
            FileHandler.showError(window.TEXT_CONFIG.FILE_PROCESS_FAILED + ': ' + error.message);
        } finally {
            UIComponents.hideProgress();
        }
    }

    /**
     * 处理拖拽文件
     */
    async handleFileDrop(event) {
        const newImages = await FileHandler.handleFileDrop(event);

        if (newImages.length > 0) {
            this.images.push(...newImages);
            this.updateImageGrid();
            this.updateToolbarState();
            this.showToolbarIfNeeded();

            FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_ADD_IMAGES.replace('{count}', newImages.length));
        }
    }

    /**
     * 处理图片选择
     */
    handleImageSelect({ imageId, selected }) {
        if (selected) {
            this.selectedImages.add(imageId);
        } else {
            this.selectedImages.delete(imageId);
        }

        // 更新图片信息
        const image = this.images.find(img => img.id === imageId);
        if (image) {
            image.selected = selected;
        }

        this.updateImageSelection();
        this.updateToolbarState();
        this.updateSidePanelState();
    }

    /**
     * 全选/取消全选
     */
    toggleSelectAll() {
        const allSelected = this.selectedImages.size === this.images.length;

        if (allSelected) {
            this.selectNone();
        } else {
            this.selectAll();
        }
    }

    /**
     * 全选
     */
    selectAll() {
        this.selectedImages.clear();
        this.images.forEach(image => {
            this.selectedImages.add(image.id);
            image.selected = true;
        });

        this.updateImageSelection();
        this.updateToolbarState();
        this.updateSidePanelState();
    }

    /**
     * 取消全选
     */
    selectNone() {
        this.selectedImages.clear();
        this.images.forEach(image => {
            image.selected = false;
        });

        this.updateImageSelection();
        this.updateToolbarState();
        this.updateSidePanelState();
    }

    /**
     * 删除选中的图片
     */
    deleteSelected() {
        if (this.selectedImages.size === 0) return;

        const imageIds = Array.from(this.selectedImages);
        UIComponents.confirmDelete(imageIds);
    }

    /**
     * 删除图片
     */
    deleteImages(imageIds) {
        imageIds.forEach(imageId => {
            const index = this.images.findIndex(img => img.id === imageId);
            if (index !== -1) {
                // 释放URL
                URL.revokeObjectURL(this.images[index].url);
                this.images.splice(index, 1);
            }
            this.selectedImages.delete(imageId);
        });

        this.updateImageGrid();
        this.updateToolbarState();
        this.updateSidePanelState();
        this.hideToolbarIfEmpty();

        FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_DELETE_IMAGES.replace('{count}', imageIds.length));
    }

    /**
     * 旋转选中的图片
     */
    async rotateSelected(angle) {
        if (this.selectedImages.size === 0) return;

        UIComponents.showProgress(0, window.TEXT_CONFIG.ROTATING_IMAGE);

        try {
            const selectedImagesList = this.images.filter(img => this.selectedImages.has(img.id));

            for (let i = 0; i < selectedImagesList.length; i++) {
                const image = selectedImagesList[i];
                await this.rotateImage(image, angle);

                const progress = ((i + 1) / selectedImagesList.length) * 100;
                UIComponents.showProgress(progress, `旋转图片 ${i + 1}/${selectedImagesList.length}`);
            }

            this.updateImageGrid();
            FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_ROTATE_IMAGES.replace('{count}', selectedImagesList.length));
        } catch (error) {
            console.error(window.TEXT_CONFIG.ROTATE_FAILED + ':', error);
            FileHandler.showError(window.TEXT_CONFIG.ROTATE_FAILED + ': ' + error.message);
        } finally {
            UIComponents.hideProgress();
        }
    }

    /**
     * 翻转选中的图片
     */
    async flipSelected(direction) {
        if (this.selectedImages.size === 0) return;

        UIComponents.showProgress(0, window.TEXT_CONFIG.FLIPPING_IMAGE);

        try {
            const selectedImagesList = this.images.filter(img => this.selectedImages.has(img.id));

            for (let i = 0; i < selectedImagesList.length; i++) {
                const image = selectedImagesList[i];
                await this.flipImage(image, direction);

                const progress = ((i + 1) / selectedImagesList.length) * 100;
                UIComponents.showProgress(progress, `翻转图片 ${i + 1}/${selectedImagesList.length}`);
            }

            this.updateImageGrid();
            FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_FLIP_IMAGES.replace('{count}', selectedImagesList.length));
        } catch (error) {
            console.error(window.TEXT_CONFIG.FLIP_FAILED + ':', error);
            FileHandler.showError(window.TEXT_CONFIG.FLIP_FAILED + ': ' + error.message);
        } finally {
            UIComponents.hideProgress();
        }
    }

    /**
     * 重置选中的图片
     */
    async resetSelected() {
        if (this.selectedImages.size === 0) return;

        UIComponents.showProgress(0, window.TEXT_CONFIG.RESETTING_IMAGE);

        try {
            const selectedImagesList = this.images.filter(img => this.selectedImages.has(img.id));

            for (let i = 0; i < selectedImagesList.length; i++) {
                const image = selectedImagesList[i];
                await this.resetImage(image);

                const progress = ((i + 1) / selectedImagesList.length) * 100;
                UIComponents.showProgress(progress, `重置图片 ${i + 1}/${selectedImagesList.length}`);
            }

            this.updateImageGrid();
            FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_RESET_IMAGES.replace('{count}', selectedImagesList.length));
        } catch (error) {
            console.error(window.TEXT_CONFIG.RESET_FAILED + ':', error);
            FileHandler.showError(window.TEXT_CONFIG.RESET_FAILED + ': ' + error.message);
        } finally {
            UIComponents.hideProgress();
        }
    }

    /**
     * 应用水印到处理器
     * @param {ImageProcessor} processor - 图片处理器
     * @param {Object} watermarkInfo - 水印信息
     */
    applyWatermarkToProcessor(processor, watermarkInfo) {
        if (!watermarkInfo || (!watermarkInfo.content && !watermarkInfo.image)) {
            return;
        }

        if (watermarkInfo.type === 'text' && watermarkInfo.content) {
            processor.addTextWatermark(watermarkInfo.content, {
                position: watermarkInfo.position,
                fontSize: watermarkInfo.style.fontSize,
                fontFamily: watermarkInfo.style.fontFamily,
                color: watermarkInfo.style.color,
                opacity: watermarkInfo.opacity
            });
        } else if (watermarkInfo.type === 'image' && watermarkInfo.image) {
            processor.addImageWatermark(watermarkInfo.image, {
                position: watermarkInfo.position,
                opacity: watermarkInfo.opacity,
                scale: watermarkInfo.scale
            });
        }
    }

    /**
     * 旋转单张图片
     */
    async rotateImage(imageInfo, angle) {
        const processor = new ImageProcessor();
        await processor.loadImage(imageInfo.file);

        // 应用现有变换
        processor.transforms = { ...imageInfo.transforms };
        processor.rotate(angle);

        // 如果图片有水印，重新应用水印
        this.applyWatermarkToProcessor(processor, imageInfo.watermark);

        // 更新变换信息
        imageInfo.transforms = { ...processor.transforms };

        // 生成新的预览URL
        const blob = await processor.toBlob('jpeg', 0.8);
        URL.revokeObjectURL(imageInfo.url);
        imageInfo.url = URL.createObjectURL(blob);

        processor.destroy();
    }

    /**
     * 翻转单张图片
     */
    async flipImage(imageInfo, direction) {
        const processor = new ImageProcessor();
        await processor.loadImage(imageInfo.file);

        // 应用现有变换
        processor.transforms = { ...imageInfo.transforms };
        processor.flip(direction);

        // 如果图片有水印，重新应用水印
        this.applyWatermarkToProcessor(processor, imageInfo.watermark);

        // 更新变换信息
        imageInfo.transforms = { ...processor.transforms };

        // 生成新的预览URL
        const blob = await processor.toBlob('jpeg', 0.8);
        URL.revokeObjectURL(imageInfo.url);
        imageInfo.url = URL.createObjectURL(blob);

        processor.destroy();
    }

    /**
     * 重置单张图片
     */
    async resetImage(imageInfo) {
        const processor = new ImageProcessor();
        await processor.loadImage(imageInfo.file);

        processor.reset();

        // 重置变换信息和水印信息
        imageInfo.transforms = {
            rotation: 0,
            flipH: false,
            flipV: false
        };

        // 清除水印信息
        imageInfo.watermark = {
            type: 'text',
            content: '',
            position: 'center',
            opacity: 0.8,
            style: {
                fontSize: 24,
                fontFamily: 'Arial',
                color: '#ffffff'
            }
        };

        // 生成新的预览URL
        const blob = await processor.toBlob('jpeg', 0.8);
        URL.revokeObjectURL(imageInfo.url);
        imageInfo.url = URL.createObjectURL(blob);

        processor.destroy();
    }

    /**
     * 预览图片
     */
    previewImage(imageId) {
        const image = this.images.find(img => img.id === imageId);
        if (!image) return;

        const previewModal = document.getElementById('previewModal');
        const previewImage = document.getElementById('previewImage');
        const previewTitle = document.getElementById('previewTitle');

        // 更新图片信息
        document.getElementById('infoName').textContent = image.name;
        document.getElementById('infoDimensions').textContent = `${image.width} × ${image.height}`;
        document.getElementById('infoSize').textContent = FileHandler.formatFileSize(image.size);
        document.getElementById('infoFormat').textContent = UIComponents.getFormatDisplay(image.type);

        previewTitle.textContent = window.TEXT_CONFIG.IMAGE_PREVIEW + ' - ' + image.name;
        previewImage.src = image.url;

        previewModal.classList.add('show');
    }

    /**
     * 转换选中图片格式
     */
    async convertSelectedFormat() {
        if (this.selectedImages.size === 0) {
            FileHandler.showError(window.TEXT_CONFIG.SELECT_IMAGES_TO_CONVERT);
            return;
        }

        UIComponents.showProgress(0, window.TEXT_CONFIG.CONVERTING_FORMAT);

        try {
            const selectedImagesList = this.images.filter(img => this.selectedImages.has(img.id));

            for (let i = 0; i < selectedImagesList.length; i++) {
                const image = selectedImagesList[i];
                await this.convertImageFormat(image);

                const progress = ((i + 1) / selectedImagesList.length) * 100;
                UIComponents.showProgress(progress, `转换图片 ${i + 1}/${selectedImagesList.length}`);
            }

            this.updateImageGrid();
            FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_CONVERT_IMAGES
                .replace('{count}', selectedImagesList.length)
                .replace('{format}', this.formatSettings.format.toUpperCase()));
        } catch (error) {
            console.error(window.TEXT_CONFIG.FORMAT_CONVERT_ERROR + ':', error);
            FileHandler.showError(window.TEXT_CONFIG.FORMAT_CONVERT_ERROR + ': ' + error.message);
        } finally {
            UIComponents.hideProgress();
        }
    }

    /**
     * 转换单张图片格式
     */
    async convertImageFormat(imageInfo) {
        const processor = new ImageProcessor();
        await processor.loadImage(imageInfo.file);

        // 应用现有变换
        processor.transforms = { ...imageInfo.transforms };
        processor.applyTransforms();

        // 如果图片有水印，重新应用水印
        this.applyWatermarkToProcessor(processor, imageInfo.watermark);

        // 转换格式
        const blob = await processor.convertFormat(
            this.formatSettings.format,
            this.formatSettings.quality
        );

        // 更新图片信息
        const newType = processor.getMimeType(this.formatSettings.format);
        const newName = this.changeFileExtension(imageInfo.name, this.formatSettings.format);

        imageInfo.type = newType;
        imageInfo.name = newName;
        imageInfo.size = blob.size;
        imageInfo.export.format = this.formatSettings.format;
        imageInfo.export.quality = this.formatSettings.quality;

        // 更新预览URL
        URL.revokeObjectURL(imageInfo.url);
        imageInfo.url = URL.createObjectURL(blob);

        processor.destroy();
    }

    /**
     * 更改文件扩展名
     */
    changeFileExtension(filename, newFormat) {
        const lastDotIndex = filename.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
        return `${nameWithoutExt}.${newFormat}`;
    }

    /**
     * 处理水印图片选择
     */
    async handleWatermarkImageSelect(file) {
        if (!file) return;

        try {
            const url = URL.createObjectURL(file);
            const img = new Image();

            img.onload = () => {
                this.watermarkSettings.image = img;
                FileHandler.showSuccess(window.TEXT_CONFIG.WATERMARK_IMAGE_LOADED);
            };

            img.onerror = () => {
                FileHandler.showError(window.TEXT_CONFIG.WATERMARK_IMAGE_LOAD_FAILED);
            };

            img.src = url;
        } catch (error) {
            console.error(window.TEXT_CONFIG.WATERMARK_IMAGE_PROCESS_FAILED + ':', error);
            FileHandler.showError(window.TEXT_CONFIG.WATERMARK_IMAGE_PROCESS_FAILED);
        }
    }

    /**
     * 应用水印到选中图片
     */
    async applyWatermarkToSelected() {
        if (this.selectedImages.size === 0) {
            FileHandler.showError(window.TEXT_CONFIG.SELECT_IMAGES_FOR_WATERMARK);
            return;
        }

        if (!this.watermarkSettings.content && !this.watermarkSettings.image) {
            FileHandler.showError(window.TEXT_CONFIG.SET_WATERMARK_CONTENT);
            return;
        }

        UIComponents.showProgress(0, window.TEXT_CONFIG.ADDING_WATERMARK);

        try {
            const selectedImagesList = this.images.filter(img => this.selectedImages.has(img.id));

            for (let i = 0; i < selectedImagesList.length; i++) {
                const image = selectedImagesList[i];
                await this.addWatermarkToImage(image);

                const progress = ((i + 1) / selectedImagesList.length) * 100;
                UIComponents.showProgress(progress, `添加水印 ${i + 1}/${selectedImagesList.length}`);
            }

            this.updateImageGrid();
            FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_ADD_WATERMARK.replace('{count}', selectedImagesList.length));
        } catch (error) {
            console.error(window.TEXT_CONFIG.WATERMARK_FAILED + ':', error);
            FileHandler.showError(window.TEXT_CONFIG.WATERMARK_FAILED + ': ' + error.message);
        } finally {
            UIComponents.hideProgress();
        }
    }

    /**
     * 为单张图片添加水印
     */
    async addWatermarkToImage(imageInfo) {
        const processor = new ImageProcessor();
        await processor.loadImage(imageInfo.file);

        // 应用现有变换
        processor.transforms = { ...imageInfo.transforms };
        processor.applyTransforms();

        // 添加水印
        if (this.watermarkSettings.type === 'text' && this.watermarkSettings.content) {
            processor.addTextWatermark(this.watermarkSettings.content, {
                position: this.watermarkSettings.position,
                fontSize: this.watermarkSettings.style.fontSize,
                fontFamily: this.watermarkSettings.style.fontFamily,
                color: this.watermarkSettings.style.color,
                opacity: this.watermarkSettings.opacity
            });
        } else if (this.watermarkSettings.type === 'image' && this.watermarkSettings.image) {
            processor.addImageWatermark(this.watermarkSettings.image, {
                position: this.watermarkSettings.position,
                opacity: this.watermarkSettings.opacity,
                scale: this.watermarkSettings.scale
            });
        }

        // 生成新的预览URL
        const blob = await processor.toBlob('jpeg', 0.8);
        URL.revokeObjectURL(imageInfo.url);
        imageInfo.url = URL.createObjectURL(blob);

        // 更新水印设置
        imageInfo.watermark = { ...this.watermarkSettings };

        processor.destroy();
    }

    /**
     * 下载图片
     */
    async downloadImages() {
        if (this.images.length === 0) return;

        const imagesToDownload = this.selectedImages.size > 0
            ? this.images.filter(img => this.selectedImages.has(img.id))
            : this.images;

        if (imagesToDownload.length === 0) return;

        if (imagesToDownload.length === 1) {
            // 下载单张图片
            const image = imagesToDownload[0];
            const response = await fetch(image.url);
            const blob = await response.blob();
            FileHandler.downloadFile(blob, image.name);
        } else {
            // 批量下载
            UIComponents.showProgress(0, window.TEXT_CONFIG.PREPARING_DOWNLOAD);

            try {
                const files = [];

                for (let i = 0; i < imagesToDownload.length; i++) {
                    const image = imagesToDownload[i];
                    const response = await fetch(image.url);
                    const blob = await response.blob();

                    files.push({
                        blob: blob,
                        filename: image.name
                    });

                    const progress = ((i + 1) / imagesToDownload.length) * 80;
                    UIComponents.showProgress(progress, `准备文件 ${i + 1}/${imagesToDownload.length}`);
                }

                UIComponents.showProgress(90, window.TEXT_CONFIG.PACKING_FILES);

                const zipName = `images_${new Date().getTime()}.zip`;
                await FileHandler.downloadMultiple(files, zipName);

                FileHandler.showSuccess(window.TEXT_CONFIG.SUCCESS_DOWNLOAD_IMAGES.replace('{count}', files.length));
            } catch (error) {
                console.error(window.TEXT_CONFIG.DOWNLOAD_FAILED + ':', error);
                FileHandler.showError(window.TEXT_CONFIG.DOWNLOAD_FAILED + ': ' + error.message);
            } finally {
                UIComponents.hideProgress();
            }
        }
    }

    /**
     * 更新图片网格
     */
    updateImageGrid() {
        const imagesGrid = document.getElementById('imagesGrid');
        UIComponents.updateImageGrid(this.images, imagesGrid);
    }

    /**
     * 更新图片选择状态
     */
    updateImageSelection() {
        const imageItems = document.querySelectorAll('.image-item');
        imageItems.forEach(item => {
            const imageId = item.dataset.imageId;
            const checkbox = item.querySelector('.image-checkbox');
            const isSelected = this.selectedImages.has(imageId);

            checkbox.checked = isSelected;
            item.classList.toggle('selected', isSelected);
        });
    }

    /**
     * 更新工具栏状态
     */
    updateToolbarState() {
        const selectedCount = this.selectedImages.size;
        const totalCount = this.images.length;

        UIComponents.updateToolbar({ selectedCount, totalCount });
    }

    /**
     * 更新侧边面板状态
     */
    updateSidePanelState() {
        const selectedCount = this.selectedImages.size;
        const totalCount = this.images.length;

        UIComponents.updateSelectedCount(selectedCount, totalCount);

        // 更新按钮状态
        const convertBtn = document.getElementById('convertBtn');
        const applyWatermarkBtn = document.getElementById('applyWatermarkBtn');

        convertBtn.disabled = selectedCount === 0;
        applyWatermarkBtn.disabled = selectedCount === 0;
    }

    /**
     * 显示工具栏（如果有图片）
     */
    showToolbarIfNeeded() {
        const toolbar = document.getElementById('toolbar');
        if (this.images.length > 0) {
            toolbar.style.display = 'flex';
        }
    }

    /**
     * 隐藏工具栏（如果没有图片）
     */
    hideToolbarIfEmpty() {
        const toolbar = document.getElementById('toolbar');
        if (this.images.length === 0) {
            toolbar.style.display = 'none';
        }
    }

    /**
     * 更新质量控制可见性
     */
    updateQualityControlVisibility() {
        const qualityControl = document.getElementById('qualityControl');
        const format = document.getElementById('targetFormat').value;

        if (format === 'jpeg') {
            qualityControl.style.display = 'block';
        } else {
            qualityControl.style.display = 'none';
        }
    }

    /**
     * 更新水印控件
     */
    updateWatermarkControls() {
        const textWatermark = document.getElementById('textWatermark');
        const imageWatermark = document.getElementById('imageWatermark');

        if (this.watermarkSettings.type === 'text') {
            textWatermark.style.display = 'block';
            imageWatermark.style.display = 'none';
        } else {
            textWatermark.style.display = 'none';
            imageWatermark.style.display = 'block';
        }
    }

    /**
     * 更新布局
     */
    updateLayout() {
        // 可以在这里添加响应式布局调整逻辑
        console.log(window.TEXT_CONFIG.LAYOUT_UPDATED);
    }
}

/**
 * 网络状态管理
 * 处理离线/在线状态检测和提示
 */
class NetworkManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineIndicator = null;
        this.init();
    }

    init() {
        this.createOfflineIndicator();
        this.setupEventListeners();
        this.updateNetworkStatus();
    }

    createOfflineIndicator() {
        this.offlineIndicator = document.createElement('div');
        this.offlineIndicator.className = 'offline-indicator';
        this.offlineIndicator.innerHTML = window.TEXT_CONFIG.OFFLINE_MODE;
        document.body.appendChild(this.offlineIndicator);
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateNetworkStatus();
            console.log(window.TEXT_CONFIG.NETWORK_RESTORED);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateNetworkStatus();
            console.log(window.TEXT_CONFIG.NETWORK_DISCONNECTED);
        });
    }

    updateNetworkStatus() {
        if (this.offlineIndicator) {
            if (this.isOnline) {
                this.offlineIndicator.classList.remove('show');
            } else {
                this.offlineIndicator.classList.add('show');
            }
        }

        // 更新UI状态
        this.updateUIForNetworkStatus();
    }

    updateUIForNetworkStatus() {
        // 可以在这里禁用/启用需要网络的功能
        const networkDependentElements = document.querySelectorAll('[data-requires-network]');
        networkDependentElements.forEach(element => {
            if (this.isOnline) {
                element.removeAttribute('disabled');
                element.style.opacity = '1';
            } else {
                element.setAttribute('disabled', 'true');
                element.style.opacity = '0.5';
            }
        });
    }

    getNetworkStatus() {
        return this.isOnline;
    }
}


/**
 * 应用性能监控
 */
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        this.monitorPageLoad();
        this.monitorMemoryUsage();
    }

    monitorPageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log(window.TEXT_CONFIG.PAGE_LOAD_PERFORMANCE, {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }, 0);
        });
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn(window.TEXT_CONFIG.HIGH_MEMORY_USAGE, {
                        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                        total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
                    });
                }
            }, 30000); // 每30秒检查一次
        }
    }
}

// 初始化全局管理器
window.addEventListener('DOMContentLoaded', () => {
    // 初始化网络管理器
    window.networkManager = new NetworkManager();

    // 初始化性能监控
    window.performanceMonitor = new PerformanceMonitor();

    console.log(window.TEXT_CONFIG.ALL_MANAGERS_INITIALIZED);
});

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImageConverterApp();
});

// 全局错误处理
window.addEventListener('error', (e) => {
    console.error(window.TEXT_CONFIG.GLOBAL_ERROR + ':', e.error);
    FileHandler.showError(window.TEXT_CONFIG.APP_ERROR_REFRESH);
});

// 预览模态窗口关闭事件
document.addEventListener('DOMContentLoaded', () => {
    const closePreview = document.getElementById('closePreview');
    const previewModal = document.getElementById('previewModal');

    if (closePreview) {
        closePreview.addEventListener('click', () => {
            previewModal.classList.remove('show');
        });
    }

    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.classList.remove('show');
            }
        });
    }
});
