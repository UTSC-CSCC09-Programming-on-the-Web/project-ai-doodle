# Project: Fit Smart

## Team Members

- **Wengxin Xu**
  Email: wengxin.xu@mail.utoronto.ca
  UTORid: xuwengxi

- **Pengpeng Cao**
  Email: p.cao@mail.utoronto.ca
  UTORid: caopeng3

---

## Project Description

**FitSmart** is a web application that helps users manage their diet and fitness plans. After logging in, users can add recipes, track calories, set health goals, follow personalized workout plans, and record daily weight with progress charts. The system offers food and exercise recommendations based on user preferences (e.g. allergies, dietary mode), with some suggestions generated asynchronously using AI.

---

## Tech Stack

- **Frontend**: Vue 3 (SPA)
- **Backend**: Express.js (REST API)
- **Database**: PostgreSQL
- **Auth**: OAuth 2.0 (Google)
- **Payment**: Stripe Checkout (Sandbox)
- **Deployment**: Docker + Docker Compose on VM
- **CI/CD**: GitHub Actions
- **Task Queue**: Bull + Redis

---

## Additional Requirement: Task Queue

We use Bull with Redis to implement asynchronous task queues. When users submit recipes or update settings, tasks are processed in the background to generate calorie analysis and health suggestions. The system will also use task queues to automatically generate weight trend reports.

---

## Milestones

### Alpha Version

- Implement Google OAuth login
- Integrate Stripe subscription system (non-subscribed users are redirected to the payment page)
- Set up basic frontend structure (home page, settings page, recipe page)
- Create database schema (users, settings, recipes, etc.)
- Implement basic recipe creation and viewing features

### Beta Version

- Integrate task queue to support asynchronous calorie analysis and recommendation generation
- Implement fitness goal setting and workout recommendations (display exercise names and video links)
- Deploy the application to a public virtual machine using Docker and Docker Compose
- Add support for allergy info and health goal preferences in user settings

### Final Version

- Implement weight tracking with chart visualization (weekly/monthly/yearly trends)
- Refine fitness recommendations with body-part-specific categories  
- Polish UI design
- Submit final documentation and demo video
