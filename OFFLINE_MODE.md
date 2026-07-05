# 📡 Офлайн режим - BlockBlast

BlockBlast полностью работает в офлайн режиме благодаря Service Worker! 🚀

## Как это работает

### Service Worker (`/public/sw.js`)
Service Worker - это специальный скрипт, который работает в фоне и:

1. **При первом визите:**
   - Кеширует критические файлы (HTML, CSS, JS, иконки)
   - Приложение сохраняется на устройстве

2. **При офлайн:**
   - Service Worker перехватывает все запросы
   - Отдает данные из локального кеша
   - Приложение работает как обычно!

3. **При возврате в онлайн:**
   - Автоматически загружает новые версии
   - Обновляет кеш в фоне
   - Вы в курсе благодаря индикатору внизу экрана

## 🎮 Как тестировать офлайн режим

### На Chrome DevTools:
```
1. F12 → Application → Service Workers
2. Отметьте checkbox "Offline"
3. Перезагрузите страницу
4. Приложение должно работать!
```

### Или через Network:
```
1. F12 → Network tab
2. В левом верхнему углу выберите "Offline"
3. Попробуйте перезагрузить
4. Страница загрузится из кеша
```

### На реальном устройстве:
1. Откройте приложение на Wifi/Мобильных данных
2. Отключите интернет (включите Airplane Mode)
3. Приложение продолжит работать!

## 📊 Что кешируется

### Обязательно (при установке):
- ✅ index.html
- ✅ manifest.json
- ✅ logo.svg
- ✅ Service Worker (sw.js)

### Автоматически (при использовании):
- ✅ CSS файлы
- ✅ JavaScript бандлы
- ✅ Изображения и SVG
- ✅ Шрифты (если добавите)

## 🔄 Стратегия кеширования

### HTML (Network First):
- Пытается загрузить новую версию с сервера
- Если сервер недоступен - использует кеш
- Гарантирует актуальный контент

### CSS/JS/Assets (Cache First):
- Сначала проверяет локальный кеш
- Если нету - загружает с сервера
- Супер быстрая загрузка!

## 🛠️ Компоненты для офлайн поддержки

### OfflineIndicator (`src/components/OfflineIndicator.jsx`)
Компонент, который показывает:
- Красное уведомление внизу экрана
- "Вы в офлайн режиме" + иконка 📡
- Исчезает, когда вернётесь в онлайн

## 📝 Проверка в консоли браузера

Откройте DevTools Console (F12 → Console) и ищите:

```
✓ Service Worker registered successfully
✓ Service Worker activated
✓ Back online
✗ Went offline
✓ Offline: serving from cache
```

## 🐛 Если что-то не работает

### Service Worker не регистрируется:
```
Решение:
1. Убедитесь, что используется HTTPS (не HTTP)
2. Проверьте, что /sw.js доступен (может быть блокирован)
3. Очистите кеш браузера: Ctrl+Shift+Delete
```

### Кеш не обновляется:
```
Решение:
1. DevTools → Application → Service Workers
2. Нажмите "Unregister"
3. Перезагрузите страницу
4. Должен установиться новый Service Worker
```

### Приложение не работает офлайн:
```
Решение:
1. Убедитесь, что приложение было открыто хотя бы раз в онлайн
2. Дождитесь, пока Service Worker активируется
3. Проверьте статус в DevTools → Application
```

### Очистить весь кеш вручную:
```javascript
// Вставьте в Console:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
  console.log('✓ Все кеши очищены');
}
```

## 📋 Требования для полной офлайн поддержки

- ✅ Service Worker зарегистрирован
- ✅ manifest.json доступен
- ✅ HTTPS на продакшене (HTTP на localhost OK)
- ✅ CSS, JS, иконки кешированы
- ✅ Звуки генерируются (Web Audio API - не нужны файлы!)

## 🚀 Оптимизация

### Уменьшить размер кеша:
```javascript
// В sw.js уменьшить urlsToCache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];
```

### Версионировать кеш:
```javascript
const CACHE_NAME = 'blockblast-v2'; // Изменить при обновлении
```

## 📚 Полезные ссылки

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Offline Web Applications](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_work_offline)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)

## ✨ Преимущества офлайн режима

| Преимущество | Описание |
|---|---|
| 🚀 Быстрая загрузка | Все из локального кеша |
| 📡 Работает без интернета | Полная функциональность офлайн |
| 💾 Экономит трафик | Уменьшает использование мобильных данных |
| 🎮 Лучший UX | Приложение всегда доступно |
| 🔄 Автоматическое обновление | SW обновляет кеш в фоне |

---

**BlockBlast теперь полностью работает офлайн! 📡✨**
