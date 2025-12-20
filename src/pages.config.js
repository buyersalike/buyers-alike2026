import Home from './pages/Home';
import Partnerships from './pages/Partnerships';
import Opportunities from './pages/Opportunities';
import Recommendations from './pages/Recommendations';
import Vendors from './pages/Vendors';
import Messages from './pages/Messages';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import News from './pages/News';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import AdCampaigns from './pages/AdCampaigns';
import Admin from './pages/Admin';
import Sitemap from './pages/Sitemap';
import PartnershipManagement from './pages/PartnershipManagement';
import OpportunityDetail from './pages/OpportunityDetail';
import Connections from './pages/Connections';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Partnerships": Partnerships,
    "Opportunities": Opportunities,
    "Recommendations": Recommendations,
    "Vendors": Vendors,
    "Messages": Messages,
    "Forum": Forum,
    "PostDetail": PostDetail,
    "News": News,
    "Profile": Profile,
    "Settings": Settings,
    "Events": Events,
    "EventDetail": EventDetail,
    "AdCampaigns": AdCampaigns,
    "Admin": Admin,
    "Sitemap": Sitemap,
    "PartnershipManagement": PartnershipManagement,
    "OpportunityDetail": OpportunityDetail,
    "Connections": Connections,
    "Projects": Projects,
    "ProjectDetail": ProjectDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};