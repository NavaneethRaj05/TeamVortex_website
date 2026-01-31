# Team Vortex Official Website

A modern, dark-themed website for Team Vortex - a college technical club focused on innovation and excellence.

## 🚀 Features

- **Modern Dark Theme**: Glassmorphism design with electric blue accents
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Interactive Components**: Dynamic team filters, event carousels, and countdown timers
- **Clean Architecture**: React with React Router for seamless navigation

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Fonts**: Inter & Montserrat from Google Fonts

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Navigation with mobile menu
│   ├── Footer.js          # Footer with contact info
│   └── FloatingTrophy.js  # Floating action button
├── pages/
│   ├── Home.js            # Landing page with hero section
│   ├── Team.js            # Team members with category filters
│   ├── Blog.js            # Blog posts with search and filters
│   ├── Events.js          # Upcoming and past events
│   ├── Contests.js        # Contest listings with countdown
│   └── SignIn.js          # Authentication page
├── App.js                 # Main app component
├── index.js              # App entry point
└── index.css             # Global styles and utilities
```

## 🎨 Design System

### Colors
- **Primary**: Electric Blue (#00D4FF)
- **Secondary**: Vortex Orange (#FF6B35)
- **Background**: Dark (#0A0A0A)
- **Glass Cards**: Semi-transparent with backdrop blur

### Typography
- **Display**: Montserrat (headings)
- **Body**: Inter (content)

### Components
- **Glass Cards**: Semi-transparent cards with blur effects
- **Gradient Text**: Blue to orange gradient for highlights
- **Hover Effects**: Smooth transitions and scale transforms

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd team-vortex-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 📱 Pages Overview

### Home Page
- Hero section with animated logo
- Vision & Mission cards
- Quick stats display
- Call-to-action buttons

### Team Page
- Categorized team member display
- Interactive filter buttons
- Social media links
- Responsive grid layout

### Blog Page
- Article cards with search functionality
- Category filtering
- Tag system
- Read time estimates

### Events Page
- Upcoming events with registration
- Past events carousel
- Event details and countdown timers
- Interactive navigation

### Contests Page
- Live contest listings
- Countdown timers
- Difficulty levels
- Team leaderboard sidebar

### Sign In Page
- Modern authentication form
- Social login options
- Glassmorphism design
- Form validation ready

## 🎯 Key Features

### Navigation
- Sticky navbar with glassmorphism effect
- Mobile-responsive overlay menu
- Active page highlighting
- Smooth transitions

### Animations
- Staggered entrance animations
- Hover effects on cards
- Smooth page transitions
- Loading states

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Adaptive typography
- Touch-friendly interactions

## 🔧 Customization

### Colors
Update colors in `tailwind.config.js`:
```javascript
colors: {
  'vortex-blue': '#00D4FF',
  'vortex-orange': '#FF6B35',
  // Add your custom colors
}
```

### Content
- Update team members in `src/pages/Team.js`
- Modify blog posts in `src/pages/Blog.js`
- Add events in `src/pages/Events.js`
- Update contests in `src/pages/Contests.js`

### Styling
- Global styles in `src/index.css`
- Component-specific styles using Tailwind classes
- Custom utilities for glassmorphism effects

## 🚀 Deployment

The app can be deployed to any static hosting service:

- **Netlify**: Connect your Git repository
- **Vercel**: Import your project
- **GitHub Pages**: Use `npm run build` and deploy the `build` folder

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, contact the Team Vortex development team.

---

**Team Vortex** - Spinning Innovation into Reality 🌪️