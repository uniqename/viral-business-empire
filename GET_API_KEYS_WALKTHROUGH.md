# 🔑 GET API KEYS WALKTHROUGH - STEP BY STEP

## 🐦 STEP 1: TWITTER API (START HERE - 5 MINUTES)

### **Go to Twitter Developer Portal:**
1. **Open:** https://developer.twitter.com/portal/dashboard
2. **Sign in** with your @BusinessEmpireHQ account
3. **Click:** "Apply for a developer account"

### **Fill Out Application:**
- **Primary reason:** "Making a bot"
- **Country:** Your country
- **Are you a developer?** "Yes"
- **Use case:** "I want to create automated posts for my business social media accounts to share business updates, revenue milestones, and educational content with my audience."
- **Will you analyze Twitter data?** "No"
- **Will your app use Tweet, Retweet, Like, Follow, or Direct Message functionality?** "Yes - for posting business content"
- **Do you plan to display Tweets or aggregate data about Twitter content outside Twitter?** "No"

### **After Approval (Usually Same Day):**
1. **Create a new App:**
   - **App name:** "Business Empire Automation"
   - **Description:** "Automated posting system for Business Empire HQ business updates"
   - **Website:** https://businessempire.netlify.app
2. **Generate Keys:**
   - Go to "Keys and tokens" tab
   - **Copy these 4 keys:**
     - API Key (Consumer Key)
     - API Secret Key (Consumer Secret)
     - Access Token
     - Access Token Secret

### **What to Send Me:**
```
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

---

## 📸 STEP 2: INSTAGRAM API (AFTER TWITTER - 10 MINUTES)

### **Requirements First:**
1. **Make sure your Instagram is a Business Account:**
   - Go to Instagram Settings > Account
   - Switch to Professional Account > Business
2. **Create/Connect Facebook Page:**
   - Go to facebook.com/pages/create
   - Name: "Business Empire HQ"
   - Connect to your Instagram

### **Get Facebook Developer Access:**
1. **Go to:** https://developers.facebook.com/
2. **Click:** "Get Started"
3. **Create New App:**
   - **App Display Name:** "Business Empire Social"
   - **App Purpose:** "Business"
   - **Business Account:** Create if needed
4. **Add Instagram Basic Display:**
   - Go to App Dashboard > Add Product
   - Find "Instagram Basic Display" > Set Up
5. **Add Instagram Graph API:**
   - Add Product > "Instagram Graph API" > Set Up

### **Generate Access Token:**
1. **Go to:** Graph API Explorer
2. **Select:** Your app name
3. **Add Permissions:**
   - instagram_basic
   - pages_show_list
   - pages_read_engagement
   - instagram_content_publish
4. **Generate Token**
5. **Get Long-Lived Token:**
   - Use Token Debugger to extend token to 60 days

### **What to Send Me:**
```
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token_here
```

---

## 💼 STEP 3: LINKEDIN API (LAST - 10 MINUTES)

### **Create LinkedIn Developer App:**
1. **Go to:** https://www.linkedin.com/developers/
2. **Click:** "Create App"
3. **Fill out:**
   - **App name:** "Business Empire Automation"
   - **LinkedIn Page:** Select your Business Empire HQ page
   - **Privacy policy URL:** https://businessempire.netlify.app/privacy
   - **App logo:** Upload any business image
4. **Products to request:**
   - Marketing Developer Platform
   - Share on LinkedIn

### **Get Authorization:**
1. **Auth tab** > Note your Client ID and Client Secret
2. **Generate Access Token:**
   - Use OAuth 2.0 flow or LinkedIn's token tool
   - Scopes needed: r_liteprofile, w_member_social

### **What to Send Me:**
```
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_ACCESS_TOKEN=your_access_token_here
```

---

## 🎯 AFTER YOU GET THE KEYS:

### **Send Me All Keys At Once:**
Once you have all the API keys, send them to me in this format:

```
TWITTER_API_KEY=abc123
TWITTER_API_SECRET=def456
TWITTER_ACCESS_TOKEN=ghi789
TWITTER_ACCESS_TOKEN_SECRET=jkl012

INSTAGRAM_ACCESS_TOKEN=mno345
FACEBOOK_PAGE_ID=123456789
FACEBOOK_PAGE_ACCESS_TOKEN=pqr678

LINKEDIN_CLIENT_ID=stu901
LINKEDIN_CLIENT_SECRET=vwx234
LINKEDIN_ACCESS_TOKEN=yzab567
```

### **I'll Then:**
1. **Update automation code** with your real keys (2 minutes)
2. **Test each platform** individually
3. **Launch live automated posting** to your real accounts
4. **Monitor first few posts** to ensure they work

---

## ⏰ TIMELINE:

**Start with Twitter** (fastest approval)
**Then Instagram** (1-2 day approval usually)  
**Then LinkedIn** (2-5 day approval)

**As soon as you get Twitter keys, send them and I'll get Twitter automation live immediately!**

**Ready to start? Begin with Twitter API application now! 🚀**