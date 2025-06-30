const CACHE_NAME = 'image-processor-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/responsive.css',
    '/scripts/main.js',
    '/scripts/file-handler.js',
    '/scripts/image-processor.js',
    '/scripts/ui-components.js',
    '/manifest.json',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
    console.log('Service Worker 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('开始缓存资源');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('资源缓存完成');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('缓存资源失败:', error);
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    console.log('Service Worker 激活中...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker 激活完成');
            return self.clients.claim();
        })
    );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
    // 只处理 GET 请求
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果在缓存中找到了请求的资源，直接返回
                if (response) {
                    console.log('从缓存返回:', event.request.url);
                    return response;
                }

                // 否则发起网络请求
                console.log('网络请求:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // 检查响应是否有效
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应，因为响应流只能使用一次
                        const responseToCache = response.clone();

                        // 将响应添加到缓存
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('网络请求失败:', error);
                        // 如果是导航请求且网络失败，返回离线页面
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        throw error;
                    });
            })
    );
});

// 处理消息
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 后台同步
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('后台同步事件');
        // 可以在这里处理离线时的操作队列
    }
});

// 推送通知
self.addEventListener('push', event => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '1'
            },
            actions: [
                {
                    action: 'explore',
                    title: '查看',
                    icon: '/assets/icons/checkmark.png'
                },
                {
                    action: 'close',
                    title: '关闭',
                    icon: '/assets/icons/xmark.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification('图片处理工具', options)
        );
    }
});
