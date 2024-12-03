# Usermaven GTM Integration Guide

This guide demonstrates how to integrate Usermaven analytics with Google Tag Manager (GTM) in your web application. We'll use a React e-commerce app as an example, showing how to track user identification and e-commerce events.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: GTM Setup](#step-1-gtm-setup)
- [Step 2: Usermaven Base Configuration](#step-2-usermaven-base-configuration)
- [Step 3: Setting Up User Identification](#step-3-setting-up-user-identification)
- [Step 4: Implementing E-commerce Events](#step-4-implementing-e-commerce-events)
- [Testing Your Implementation](#testing-your-implementation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. A Google Tag Manager account and container
2. A Usermaven account with your tracking key
3. Basic understanding of JavaScript and GTM

## Step 1: GTM Setup

1. Create a new GTM container or use an existing one
2. Add GTM snippet to your website's `<head>` section:
   ```html
   <!-- Google Tag Manager -->
   <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
   new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
   j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
   'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
   })(window,document,'script','dataLayer','GTM-XXXX');</script>
   <!-- End Google Tag Manager -->
   ```

3. Add GTM noscript tag after the opening `<body>` tag:
   ```html
   <!-- Google Tag Manager (noscript) -->
   <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
   height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
   <!-- End Google Tag Manager (noscript) -->
   ```

## Step 2: Usermaven Base Configuration

1. In GTM, create a new tag:
   - Name: "Usermaven Pixel"
   - Type: Custom HTML
   - Paste this code:
   ```html
   <script type="text/javascript">     
       (function () {
           window.usermaven = window.usermaven || (function () { (window.usermavenQ = window.usermavenQ || []).push(arguments); })
           var t = document.createElement('script'),
               s = document.getElementsByTagName('script')[0];
           t.defer = true;
           t.id = 'um-tracker';
           t.setAttribute('data-tracking-host', "https://events.usermaven.com")
           t.setAttribute('data-key', 'YOUR-KEY-HERE');
           t.setAttribute('data-autocapture', 'true');  
           t.src = 'https://t.usermaven.com/lib.js';
           s.parentNode.insertBefore(t, s);
       })();
   </script>
   ```
   - Replace 'YOUR-KEY-HERE' with your Usermaven tracking key

2. Set trigger to: All Pages

3. Create a Data Layer Variable:
   - Name: "dlv - usermaven_event"
   - Variable Type: Data Layer Variable
   - Data Layer Variable Name: "usermaven_event"
   - Leave other settings as default

## Step 3: Setting Up User Identification

The user identify event is crucial for tracking user behavior across sessions. You must trigger this event in three scenarios:
1. After successful login
2. After successful signup
3. On page refresh when a user is already logged in

### 3.1 GTM Configuration

1. Create a new tag for user identification:
   - Name: "UM - Identify"
   - Type: Custom HTML
   - Paste this code:
   ```html
   <script>
     var eventData = {{dlv - usermaven_event}};
     usermaven("id", {
       id: eventData.id,
       first_name: eventData.first_name,
       email: eventData.email,
       created_at: eventData.created_at,
       custom: eventData.custom || {}
     });
   </script>
   ```

2. Create a trigger:
   - Name: "User Identify Event"
   - Type: Custom Event
   - Event name: user_identify

### 3.2 Implementation in Your Code

Here's a complete example using React Context for user management:

```typescript
import React, { createContext, useState, useEffect } from 'react';

export const UserProvider = ({ children }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Identify user on page load if they're logged in
  useEffect(() => {
    if (user) {
      window.dataLayer?.push({
        event: 'user_identify',
        usermaven_event: {
          first_name: user.first_name,
          id: user.id?.toString(),
          email: user.email,
          created_at: user.created_at,
          custom: {
            plan: 'free'
          }
        }
      });
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const user = await loginUser(email, password);
      if (user) {
        setUser(user);
        // Identify user after successful login
        window.dataLayer?.push({
          event: 'user_identify',
          usermaven_event: {
            first_name: user.first_name,
            id: user.id?.toString(),
            email: user.email,
            created_at: user.created_at,
            custom: {
              plan: 'free'
            }
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email, password, name) => {
    try {
      const newUser = await createUser({ email, password, name });
      setUser(newUser);
      
      // Track signup event
      window.dataLayer?.push({
        event: 'signed_up',
        usermaven_event: {
          first_name: newUser.first_name,
          id: newUser.id?.toString(),
          email: newUser.email,
          created_at: newUser.created_at,
          custom: {
            plan: 'free'
          }
        }
      });

      // Also identify the user after signup
      window.dataLayer?.push({
        event: 'user_identify',
        usermaven_event: {
          first_name: newUser.first_name,
          id: newUser.id?.toString(),
          email: newUser.email,
          created_at: newUser.created_at,
          custom: {
            plan: 'free'
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, login, signup }}>
      {children}
    </UserContext.Provider>
  );
};
```

### 3.3 Key Points for User Identification

1. **When to Trigger Identify Event**
   ```typescript
   // 1. After successful login
   const onLogin = async (email, password) => {
     const success = await login(email, password);
     if (success) {
       // User identify event is triggered inside login function
     }
   };

   // 2. After successful signup
   const onSignup = async (email, password, name) => {
     const success = await signup(email, password, name);
     if (success) {
       // Both signed_up and user_identify events are triggered inside signup function
     }
   };

   // 3. On page load with existing session
   useEffect(() => {
     const savedUser = localStorage.getItem('currentUser');
     if (savedUser) {
       const user = JSON.parse(savedUser);
       // Trigger user identify event
       window.dataLayer?.push({
         event: 'user_identify',
         usermaven_event: {
           first_name: user.first_name,
           id: user.id?.toString(),
           email: user.email,
           created_at: user.created_at,
           custom: {
             plan: 'free'
           }
         }
       });
     }
   }, []);
   ```

2. **Required User Properties**
   - `id`: Unique identifier for the user
   - `first_name`: User's display name (Optional)
   - `email`: User's email address
   - `created_at`: Timestamp when user account was created
   - `custom`: Object for additional custom properties (Optional)

4. **Best Practices**
   - Always trigger identify event before tracking user actions
   - Include consistent user properties across all identify events
   - Handle failed login/signup attempts appropriately
   - Ensure user data is cleared on logout

### 3.4 Testing User Identification

1. Test Login Flow:
   - Open GTM Preview mode
   - Log in with test credentials
   - Verify `user_identify` event fires with correct user data
   - Check Usermaven dashboard for user identification

2. Test Signup Flow:
   - Create new account
   - Verify both `signed_up` and `user_identify` events fire
   - Check Usermaven dashboard for new user

3. Test Page Refresh:
   - Log in and refresh the page
   - Verify `user_identify` event fires automatically
   - Check user properties are consistent

4. Test Logout:
   - Log out and verify localStorage is cleared
   - Verify no identify events fire after logout

## Step 4: Implementing E-commerce Events

### Add to Cart Event

1. Create a new tag:
   - Name: "UM - Add to Cart"
   - Type: Custom HTML
   - Paste this code:
   ```html
   <script>
     var eventData = {{dlv - usermaven_event}};
     usermaven("track", 'add_to_cart', {
       value: eventData.value,
       currency: eventData.currency,
       items: eventData.items || []
     });
   </script>
   ```

2. Create a trigger:
   - Name: "Add to Cart Event"
   - Type: Custom Event
   - Event name: add_to_cart

3. In your code, implement the add_to_cart event:
   ```typescript
   window.dataLayer?.push({
     event: 'add_to_cart',
     usermaven_event: {
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

## Tag Sequencing

For all Usermaven event tags:
1. Go to Advanced Settings
2. Enable "Fire a tag before UM [Event] fires"
3. Select "Usermaven Pixel"
4. Choose "Once per page"

This ensures the Usermaven library is loaded before any events are tracked.

## Testing Your Implementation

1. Enable GTM Preview mode
2. Check that the Usermaven Pixel loads on all pages
3. Test user identification:
   - Log in or sign up
   - Verify "user_identify" event in GTM debug panel
   - Check Usermaven dashboard for user data
4. Test add to cart:
   - Add a product to cart
   - Verify "add_to_cart" event in GTM debug panel
   - Check Usermaven dashboard for event data

## Troubleshooting

Common issues and solutions:

1. Events not firing
   - Check browser console for errors
   - Verify GTM container is loading
   - Ensure dataLayer push occurs before GTM trigger
   
2. Missing user data
   - Verify user object structure matches expected format
   - Check Data Layer Variable configuration
   - Ensure Usermaven Pixel loads before events

3. Invalid event data
   - Validate JSON structure in dataLayer push
   - Check for required fields in event data
   - Verify data types match expected format

## Example Implementation

Check out our [demo repository](https://github.com/usermaven/usermaven-react-gtm-example) for a complete working example using React and TypeScript.

## Support

For additional help:
- [Usermaven Documentation](https://usermaven.com/docs)
- [GTM Documentation](https://support.google.com/tagmanager)
- [Create an issue](https://github.com/usermaven/usermaven-react-gtm-example/issues)
