# Usermaven GTM E-Commerce Demo

This project demonstrates the integration of Usermaven analytics with Google Tag Manager (GTM) in a React e-commerce application. It showcases user tracking, product interactions, and purchase events using Usermaven's powerful analytics capabilities.

## Features

- 🛍️ E-commerce functionality (products, cart, checkout)
- 👤 User authentication (signup/login)
- 📊 Usermaven analytics integration via GTM
- 🔄 Real-time event tracking

## Event Tracking Implementation

### 1. GTM Base Setup

First, add the Usermaven Pixel tag in GTM:

```html
<script type="text/javascript">     
    (function () {
        window.usermaven = window.usermaven || (function () { (window.usermavenQ = window.usermavenQ || []).push(arguments); })
        var t = document.createElement('script'),
            s = document.getElementsByTagName('script')[0];
        t.defer = true;
        t.id = 'um-tracker';
        t.setAttribute('data-tracking-host', "https://events.usermaven.com")
        t.setAttribute('data-key', 'UMXXXXXX');
        t.setAttribute('data-autocapture', 'true');  
        t.src = 'https://t.usermaven.com/lib.js';
        s.parentNode.insertBefore(t, s);
    })();
</script>
```

Trigger: All Pages

### 2. User Identification Events

#### User Identify Tag
```html
<script>
  var eventData = {{dlv - usermaven_event}};
  usermaven("id", {
    id: eventData.id,
    user_name: eventData.user_name,
    email: eventData.email,
    created_at: eventData.created_at,
    custom: eventData.custom || {}
  });
</script>
```

Data Layer Push Format:
```javascript
window.dataLayer?.push({
  event: 'user_identify',
  usermaven_event: {
    name: 'user_identify',
    user_name: user.name,
    id: user.id?.toString(),
    email: user.email,
    created_at: user.created_at,
    custom: {
      plan: 'free'
    }
  }
});
```

### 3. E-commerce Events

#### Add to Cart Tag
```html
<script>
  var eventData = {{dlv - usermaven_event}};
  usermaven("track", {
    value: eventData.value,
    currency: eventData.currency,
    items: eventData.items || []
  });
</script>
```

Data Layer Push Format:
```javascript
window.dataLayer?.push({
  event: 'add_to_cart',
  usermaven_event: {
    name: 'add_to_cart',
    value: item.price,
    currency: 'USD',
    items: [{
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: 1
    }]
  }
});
```

## GTM Configuration Steps

1. Create Variables:
   - Create a Data Layer Variable named `dlv - usermaven_event`
   - Variable type: Data Layer Variable
   - Data Layer Variable Name: `usermaven_event`

2. Create Triggers:
   - All Pages: For Usermaven Pixel
   - Custom Event: `user_identify`
   - Custom Event: `add_to_cart`
   - Custom Event: `signed_up`

3. Create Tags:
   - Usermaven Pixel (Base Tag)
   - UM - Identify
   - UM - Add to Cart
   - UM - Signed Up

4. Tag Sequencing:
   - Set Usermaven Pixel as a setup tag for all other tags
   - Ensure Usermaven Pixel fires first

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Built With

- React + TypeScript
- Vite
- Tailwind CSS
- Google Tag Manager
- Usermaven Analytics

## License

MIT
