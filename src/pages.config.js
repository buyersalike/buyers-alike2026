/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ActivityFeed from './pages/ActivityFeed';
import AdCampaigns from './pages/AdCampaigns';
import Admin from './pages/Admin';
import Forum from './pages/Forum';
import Home from './pages/Home';
import Messages from './pages/Messages';
import News from './pages/News';
import Onboarding from './pages/Onboarding';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import PartnershipManagement from './pages/PartnershipManagement';
import Partnerships from './pages/Partnerships';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import Sitemap from './pages/Sitemap';
import Vendors from './pages/Vendors';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActivityFeed": ActivityFeed,
    "AdCampaigns": AdCampaigns,
    "Admin": Admin,
    "Forum": Forum,
    "Home": Home,
    "Messages": Messages,
    "News": News,
    "Onboarding": Onboarding,
    "Opportunities": Opportunities,
    "OpportunityDetail": OpportunityDetail,
    "PartnershipManagement": PartnershipManagement,
    "Partnerships": Partnerships,
    "PostDetail": PostDetail,
    "Profile": Profile,
    "Recommendations": Recommendations,
    "Settings": Settings,
    "Sitemap": Sitemap,
    "Vendors": Vendors,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};