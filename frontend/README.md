# React + TypeScript + Vite

## initialization step

- npm create vite@latest frontend --template react
- npm install
- npm install tailwindcss @tailwindcss/vite
- go to [https://tailwindcss.com/docs/installation/using-vite]
- npm install react-icons
- npm install @react-spring/three
- npm install three @react-three/fiber @react-three/drei
- npm install framer-motion
- npm install react-router-dom
- npm install axios
- npm install zustand

## https server setup

- ngrok http 5173 (use https localhost server port)
- update "vite.config.ts" embed https server code

### 🔐 How to generate HTTPS certs for localhost (one-time)

- Run this in your project root (terminal)
-- mkdir certs
-- openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/localhost-key.pem -out certs/localhost.pem -days 365 -subj "/CN=localhost"

-- This generates:
--- certs/localhost.pem → certificate
--- certs/localhost-key.pem → private key

## credential should store on HTTPonly for cookies for security for malforming and avoid other user manually fill the localstorage to signin

- backend and frontend setup should allow-origin-route https or ngrok

## setup nodmailer Email-based Password Reset Link

### backend setup

- npm init -y
- install nodemailer [npm install nodemailer]
- npm install -D nodemon@latest [2 times]
- npm install express mongoose cors dotenv bcryptjs jsonwebtoken cookie-parser

#### setup gmail account using personal accounts only

##### Steps to Generate App Password

- Go to: [https://myaccount.google.com/security]
- Under “Signing in to Google”, make sure 2-Step Verification is turned on.
- Once 2FA is enabled, go back to the same page.
- Go to 👉 [https://myaccount.google.com/apppasswords]
- Google may ask you to log in again.
- Once on the page:
- Under “Select app”, choose Mail
- Under “Select device”, choose Other (Custom name) - type something like: NodemailerApp
- Click Generate
- Google will show a 16-character app password (like abcd efgh ijkl mnop).
- remove space
- environemnt folder should CLIENT_URL=[https://localhost:5173] EMAIL_USER=[mithunkumar092856@gmail.com] EMAIL_PASS=feduynmuweapqwyz

## Google SignIn logic

### backend set

- npm install google-auth-library

### frontend setup

- npm install @react-oauth/google

## facbook login

- [https://developers.facebook.com] register this with multiple accounts for set administrative and testers.

- set role, use cases with oauth valid url for backend url.
- set basic, add domain, set platform with frontend url.
- set usecase to add email also.

### frontend changes

- SignIn screen useeffect and button.

### backend changes

- routes
- controller
- npm install passport passport-facebook
- npm install axios
- .env include FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

- [ cloudflared tunnel --url http://localhost:3000 ] cloudflared tunnel for https.
