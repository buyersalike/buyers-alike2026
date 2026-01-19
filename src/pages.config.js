import ActivityFeed from './pages/ActivityFeed';
import AdCampaigns from './pages/AdCampaigns';
import Admin from './pages/Admin';
import Connections from './pages/Connections';
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
    "Connections": Connections,
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