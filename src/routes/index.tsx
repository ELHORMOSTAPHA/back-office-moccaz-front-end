import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import MainLayout from '@/layouts/MainLayout.tsx'
import AuthRoute from '@/routes/AuthRoute'
// import SocialFeed from "@/views/apps/social-feed";
import Logout from '@/views/auth/logout'
import AdminRoute from './AdminRoute'
import ClientRoute from './ClientRoute'
import ProtectedRoute from './ProtectedRoute';

// Dashboards
const Dashboard = lazy(() => import('@/views/dashboards/dashboard'))
// const Dashboard2 = lazy(() => import('@/views/dashboards/dashboard2'))

// Landing
const Landing = lazy(() => import('@/views/landing'))

// Ecommerce
// const ProductList = lazy(() => import('@/views/ecommerce/products'))
// const ProductGrid = lazy(() => import('@/views/ecommerce/products-grid'))
// const ProductDetails = lazy(() => import('@/views/ecommerce/products/[productId]'))
// const AddProduct = lazy(() => import('@/views/ecommerce/add-product'))
// const Categories = lazy(() => import('@/views/ecommerce/categories'))
// const Orders = lazy(() => import('@/views/ecommerce/orders'))
// const OrderDetails = lazy(() => import('@/views/ecommerce/orders/[orderId]'))
// const Customers = lazy(() => import('@/views/ecommerce/customers'))
// const Sellers = lazy(() => import('@/views/ecommerce/sellers'))
// const SellerDetails = lazy(() => import('@/views/ecommerce/sellers/[sellerId]'))
// const Reviews = lazy(() => import('@/views/ecommerce/reviews'))

// Apps
// const Inbox = lazy(() => import('@/views/apps/email/inbox'))
// const InboxDetails = lazy(() => import('@/views/apps/email/inbox/[inboxId]'))
// const EmailCompose = lazy(() => import('@/views/apps/email/email-compose'))
// const EmailTemplates = lazy(() => import('@/views/apps/email/email-templates'))

// const FileManager = lazy(() => import('@/views/apps/file-manager'))
// const Chat = lazy(() => import('@/views/apps/chat'))
// const Calendar = lazy(() => import('@/views/apps/calendar'))
const Hostorique_demandes = lazy(() => import('@/views/ecommerce/orders'))
const Creer_demande = lazy(() => import('@/views/apps/portiel-client/creer_demande'))
const ClientDashboard = lazy(() => import('@/views/apps/portiel-client/dashboard'))
// const Creer_demande=lazy(() => import('@/views/ecommerce/orders'));
const InvoiceList = lazy(() => import('@/views/apps/invoice/invoices'))
const InvoiceDetails = lazy(() => import('@/views/apps/invoice/invoices/[invoiceId]'))
const AddInvoice = lazy(() => import('@/views/apps/invoice/add-invoice'))

const Planification = lazy(() => import('@/views/apps/planification'))
const Missions = lazy(() => import('@/views/apps/missions/missions'))

// const Voyages = lazy(() => import('@/views/apps/voyages'))
const Trajets = lazy(() => import('@/views/apps/trajet'))

const Clients = lazy(() => import('@/views/apps/clients'))
// const Annonces = lazy(() => import('@/views/apps/annonces'))
const Boutiques = lazy(() => import('@/views/apps/boutiques'))
const Announce = lazy(() => import('@/views/apps/announces'))
const Historique = lazy(() => import('@/views/apps/historique'))
const DemandeReservation = lazy(() => import('@/views/apps/demande_reservation'))
const Depot = lazy(() => import('@/views/apps/depot'))
const AddClient = lazy(() => import('@/views/apps/clients/add-stock'))
const EditClient = lazy(() => import('@/views/apps/clients/edit-stock'))

// const ApiKeys = lazy(() => import('@/views/apps/api-key'))

// const TicketList = lazy(() => import('@/views/apps/support-center/tickets-list'))
// const TicketDetails = lazy(() => import('@/views/apps/support-center/ticket-details'))
// const TicketCreate = lazy(() => import('@/views/apps/support-center/ticket-create'))

// CRM
// const Activities = lazy(() => import('@/views/apps/crm/activities'))
// const Campaign = lazy(() => import('@/views/apps/crm/campaign'))
// const Contacts = lazy(() => import('@/views/apps/crm/contacts'))
// const CrmCustomers = lazy(() => import('@/views/apps/crm/customers'))
// const Estimations = lazy(() => import('@/views/apps/crm/estimations'))
// const Opportunities = lazy(() => import('@/views/apps/crm/opportunities'))
// const Deals = lazy(() => import('@/views/apps/crm/deals'))
// const Leads = lazy(() => import('@/views/apps/crm/leads'))
// const Pipeline = lazy(() => import('@/views/apps/crm/pipeline'))
// const Proposals = lazy(() => import('@/views/apps/crm/proposals'))

//users
const Profile = lazy(() => import('@/views/apps/users/profile'))
// const UserContacts = lazy(() => import('@/views/apps/users/contacts'))
// const Permissions = lazy(() => import('@/views/apps/users/permissions'))
const Utilisateurs = lazy(() => import('@/views/apps/parametres/utilisateurs'))
const Profiles = lazy(() => import('@/views/apps/parametres/profiles'))
const Chaufeurs = lazy(() => import('@/views/apps/menu/chaufeurs'))
const Vehicules = lazy(() => import('@/views/apps/menu/vehicules'))


// Pages
// const Faq = lazy(() => import('@/views/pages/faq'))
// const Pricing = lazy(() => import('@/views/pages/pricing'))
// const EmptyPage = lazy(() => import('@/views/pages/empty-page'))
// const Timeline = lazy(() => import('@/views/pages/timeline'))
// const SearchResults = lazy(() => import('@/views/pages/search-results'))
// const ComingSoon = lazy(() => import('@/views/other-pages/coming-soon'))
// const TermsConditions = lazy(() => import('@/views/pages/terms-conditions'))
// const Sitemap = lazy(() => import('@/views/pages/sitemap'))

// Miscellaneous
// const NestableList = lazy(() => import('@/views/miscellaneous/nestable-list'))
// const PdfViewer = lazy(() => import('@/views/miscellaneous/pdf-viewer'))
// const SweetAlert = lazy(() => import('@/views/miscellaneous/sweet-alert'))
// const PasswordMeter = lazy(() => import('@/views/miscellaneous/password-meter'))
// const Clipboard = lazy(() => import('@/views/miscellaneous/clipboard'))
// const TreeView = lazy(() => import('@/views/miscellaneous/tree-view'))
// const Tour = lazy(() => import('@/views/miscellaneous/tour'))

// Auth
const Auth1SignIn = lazy(() => import('@/views/auth/auth-2/sign-in'))
const ResetPassword = lazy(() => import('@/views/auth/auth-2/reset-password'))
const NewPassword = lazy(() => import('@/views/auth/auth-2/new-password'))
// const Auth1SignUp = lazy(() => import('@/views/auth/auth-1/sign-up'))
// const Auth1ResetPassword = lazy(() => import('@/views/auth/auth-1/reset-password'))
// const Auth1NewPassword = lazy(() => import('@/views/auth/auth-1/new-password'))
// const Auth1TwoFactor = lazy(() => import('@/views/auth/auth-1/two-factor'))
// const Auth1LockScreen = lazy(() => import('@/views/auth/auth-1/lock-screen'))
// const Auth1SuccessMail = lazy(() => import('@/views/auth/auth-1/success-mail'))
// const Auth1LoginPin = lazy(() => import('@/views/auth/auth-1/login-pin'))
// const Auth1DeleteAccount = lazy(() => import('@/views/auth/auth-1/delete-account'))

// const Auth2SignIn = lazy(() => import('@/views/auth/auth-2/sign-in'))
// const Auth2SignUp = lazy(() => import('@/views/auth/auth-2/sign-up'))
// const Auth2ResetPassword = lazy(() => import('@/views/auth/auth-2/reset-password'))
// const Auth2NewPassword = lazy(() => import('@/views/auth/auth-2/new-password'))
// const Auth2TwoFactor = lazy(() => import('@/views/auth/auth-2/two-factor'))
// const Auth2LockScreen = lazy(() => import('@/views/auth/auth-2/lock-screen'))
// const Auth2SuccessMail = lazy(() => import('@/views/auth/auth-2/success-mail'))
// const Auth2LoginPin = lazy(() => import('@/views/auth/auth-2/login-pin'))
// const Auth2DeleteAccount = lazy(() => import('@/views/auth/auth-2/delete-account'))

// Error
// const Error400 = lazy(() => import('@/views/error/400'))
// const Error401 = lazy(() => import('@/views/error/401'))
// const Error403 = lazy(() => import('@/views/error/403'))
// const Error404 = lazy(() => import('@/views/error/404'))
// const Error408 = lazy(() => import('@/views/error/408'))
// const Error500 = lazy(() => import('@/views/error/500'))
// const Maintenance = lazy(() => import('@/views/other-pages/maintenance'))

// Layouts
// const ScrollableLayout = lazy(() => import('@/views/layouts/scrollable'))
// const CompactLayout = lazy(() => import('@/views/layouts/compact'))
// const BoxedLayout = lazy(() => import('@/views/layouts/boxed'))
// const HorizontalLayout = lazy(() => import('@/views/layouts/horizontal'))

// const SidebarCompact = lazy(() => import('@/views/layouts/sidebars/compact'))
// const SidebarIconView = lazy(() => import('@/views/layouts/sidebars/icon-view'))
// const SidebarOnHover = lazy(() => import('@/views/layouts/sidebars/on-hover'))
// const SidebarOnHoverActive = lazy(() => import('@/views/layouts/sidebars/on-hover-active'))
// const SidebarOffcanvas = lazy(() => import('@/views/layouts/sidebars/offcanvas'))
// const SidebarNoIconsLines = lazy(() => import('@/views/layouts/sidebars/no-icons-with-lines'))
// const SidebarWithLines = lazy(() => import('@/views/layouts/sidebars/with-lines'))
// const SidebarLight = lazy(() => import('@/views/layouts/sidebars/light'))
// const SidebarGradient = lazy(() => import('@/views/layouts/sidebars/gradient'))
// const SidebarGray = lazy(() => import('@/views/layouts/sidebars/gray'))
// const SidebarImage = lazy(() => import('@/views/layouts/sidebars/image'))

// const TopbarDark = lazy(() => import('@/views/layouts/topbars/dark'))
// const TopbarGray = lazy(() => import('@/views/layouts/topbars/gray'))
// const TopbarGradient = lazy(() => import('@/views/layouts/topbars/gradient'))

// UI
// const Accordions = lazy(() => import('@/views/ui/accordions'))
// const Alerts = lazy(() => import('@/views/ui/alerts'))
// const Images = lazy(() => import('@/views/ui/images'))
// const Badges = lazy(() => import('@/views/ui/badges'))
// const Breadcrumb = lazy(() => import('@/views/ui/breadcrumb'))
// const Buttons = lazy(() => import('@/views/ui/buttons'))
// const Cards = lazy(() => import('@/views/ui/cards'))
// const Carousel = lazy(() => import('@/views/ui/carousel'))
// const Collapse = lazy(() => import('@/views/ui/collapse'))
// const Colors = lazy(() => import('@/views/ui/colors'))
// const Dropdowns = lazy(() => import('@/views/ui/dropdowns'))
// const Videos = lazy(() => import('@/views/ui/videos'))
// const Grid = lazy(() => import('@/views/ui/grid'))
// const Links = lazy(() => import('@/views/ui/links'))
// const ListGroup = lazy(() => import('@/views/ui/list-group'))
// const Modals = lazy(() => import('@/views/ui/modals'))
// const Notifications = lazy(() => import('@/views/ui/notifications'))
// const Offcanvas = lazy(() => import('@/views/ui/offcanvas'))
// const Placeholders = lazy(() => import('@/views/ui/placeholders'))
// const Pagination = lazy(() => import('@/views/ui/pagination'))
// const Popovers = lazy(() => import('@/views/ui/popovers'))
// const Progress = lazy(() => import('@/views/ui/progress'))
// const Spinners = lazy(() => import('@/views/ui/spinners'))
// const Tabs = lazy(() => import('@/views/ui/tabs'))
// const Tooltips = lazy(() => import('@/views/ui/tooltips'))
// const Typography = lazy(() => import('@/views/ui/typography'))
// const Utilities = lazy(() => import('@/views/ui/utilities'))

// Components
// const Widgets = lazy(() => import('@/views/widgets'))

// charts
// const ApexArea = lazy(() => import('@/views/charts/apex/area'))
// const ApexBar = lazy(() => import('@/views/charts/apex/bar'))
// const ApexBubble = lazy(() => import('@/views/charts/apex/bubble'))
// const ApexCandlestick = lazy(() => import('@/views/charts/apex/candlestick'))
// const ApexColumn = lazy(() => import('@/views/charts/apex/column'))
// const ApexHeatmap = lazy(() => import('@/views/charts/apex/heatmap'))
// const ApexLine = lazy(() => import('@/views/charts/apex/line'))
// const ApexMixed = lazy(() => import('@/views/charts/apex/mixed'))
// const ApexTimeline = lazy(() => import('@/views/charts/apex/timeline'))
// const ApexBoxplot = lazy(() => import('@/views/charts/apex/boxplot'))
// const ApexTreemap = lazy(() => import('@/views/charts/apex/treemap'))
// const ApexPie = lazy(() => import('@/views/charts/apex/pie'))
// const ApexRadar = lazy(() => import('@/views/charts/apex/radar'))
// const ApexRadialbar = lazy(() => import('@/views/charts/apex/radialbar'))
// const ApexScatter = lazy(() => import('@/views/charts/apex/scatter'))
// const ApexPolarArea = lazy(() => import('@/views/charts/apex/polar-area'))
// const ApexSparklines = lazy(() => import('@/views/charts/apex/sparklines'))
// const ApexRange = lazy(() => import('@/views/charts/apex/range'))
// const ApexFunnel = lazy(() => import('@/views/charts/apex/funnel'))
// const ApexSlope = lazy(() => import('@/views/charts/apex/slope'))

// const LineChartjsCharts = lazy(() => import('@/views/charts/chartjs/line'))
// const BarChartjsCharts = lazy(() => import('@/views/charts/chartjs/bar'))
// const AreaChartjsCharts = lazy(() => import('@/views/charts/chartjs/area'))
// const OtherChartjsCharts = lazy(() => import('@/views/charts/chartjs/other'))

// const ApexTree = lazy(() => import('@/views/charts/apex-tree'))

// Forms
// const BasicElements = lazy(() => import('@/views/forms/basic'))
// const Pickers = lazy(() => import('@/views/forms/pickers'))
// const Select = lazy(() => import('@/views/forms/select'))
// const Validation = lazy(() => import('@/views/forms/validation'))
// const Wizard = lazy(() => import('@/views/forms/wizard'))
// const FileUploads = lazy(() => import('@/views/forms/file-uploads'))
// const TextEditors = lazy(() => import('@/views/forms/editors'))
// const Slider = lazy(() => import('@/views/forms/slider'))
// const Layouts = lazy(() => import('@/views/forms/layouts'))
// const OtherPlugins = lazy(() => import('@/views/forms/other-plugins'))

// Tables
// const TanstackTables = lazy(() => import('@/views/tables/tanstack'))
// const StaticTables = lazy(() => import('@/views/tables/static'))
// const AddRowsDataTable = lazy(() => import('@/views/tables/data-tables/add-rows'))
// const AjaxDataTable = lazy(() => import('@/views/tables/data-tables/ajax'))
// const BasicDataTable = lazy(() => import('@/views/tables/data-tables/basic'))
// const CheckboxSelectDataTable = lazy(() => import('@/views/tables/data-tables/checkbox-select'))
// const ChildRowsDataTable = lazy(() => import('@/views/tables/data-tables/child-rows'))
// const ColumnSearchDataTable = lazy(() => import('@/views/tables/data-tables/column-searching'))
// const ColumnsDataTable = lazy(() => import('@/views/tables/data-tables/columns'))
// const DataRenderingDataTable = lazy(() => import('@/views/tables/data-tables/data-rendering'))
// const ExportDataTable = lazy(() => import('@/views/tables/data-tables/export-data'))
// const FixedHeaderDataTable = lazy(() => import('@/views/tables/data-tables/fixed-header'))
// const JavaScriptSourceDataTable = lazy(() => import('@/views/tables/data-tables/javascript-source'))
// const ScrollDataTable = lazy(() => import('@/views/tables/data-tables/scroll'))
// const SelectDataTable = lazy(() => import('@/views/tables/data-tables/select'))

// Icons
// const Flags = lazy(() => import('@/views/icons/flags'))
// const LucideIcons = lazy(() => import('@/views/icons/lucide'))
// const TablerIcons = lazy(() => import('@/views/icons/tabler'))

// Maps
// const VectorMap = lazy(() => import('@/views/maps/vector'))
// const LeafletMap = lazy(() => import('@/views/maps/leaflet'))

const authRoutes: RouteObject[] = [
    { path: '/login', element: <Auth1SignIn /> },
    {path:'/reset-password',element:<ResetPassword/>},
    {path:'/new-password',element:<NewPassword/>},
    // { path: '/auth-1/sign-in', element: <Auth1SignIn /> },
    // { path: '/auth-1/sign-up', element: <Auth1SignUp /> },
    // { path: '/auth-1/reset-password', element: <Auth1ResetPassword /> },
    // { path: '/auth-1/new-password', element: <Auth1NewPassword /> },
    // { path: '/auth-1/two-factor', element: <Auth1TwoFactor /> },
    // { path: '/auth-1/lock-screen', element: <Auth1LockScreen /> },
    // { path: '/auth-1/success-mail', element: <Auth1SuccessMail /> },
    // { path: '/auth-1/login-pin', element: <Auth1LoginPin /> },
    // { path: '/auth-1/delete-account', element: <Auth1DeleteAccount /> },
    // { path: '/auth-2/sign-in', element: <Auth2SignIn /> },
    // { path: '/auth-2/sign-up', element: <Auth2SignUp /> },
    // { path: '/auth-2/reset-password', element: <Auth2ResetPassword /> },
    // { path: '/auth-2/new-password', element: <Auth2NewPassword /> },
    // { path: '/auth-2/two-factor', element: <Auth2TwoFactor /> },
    // { path: '/auth-2/lock-screen', element: <Auth2LockScreen /> },
    // { path: '/auth-2/success-mail', element: <Auth2SuccessMail /> },
    // { path: '/auth-2/login-pin', element: <Auth2LoginPin /> },
    // { path: '/auth-2/delete-account', element: <Auth2DeleteAccount /> },
]

const errorRoutes: RouteObject[] = [
    // { path: '/error/400', element: <Error400 /> },
    // { path: '/error/401', element: <Error401 /> },
    // { path: '/error/403', element: <Error403 /> },
    // { path: '/error/404', element: <Error404 /> },
    // { path: '/error/408', element: <Error408 /> },
    // { path: '/error/500', element: <Error500 /> },
]

const otherPagesRoutes: RouteObject[] = [
    // { path: '/coming-soon', element: <ComingSoon /> },
    // { path: '/maintenance', element: <Maintenance /> },
]

// const dashboardRoutes: RouteObject[] = [
//     //work with it
//     {path: '/dashboard', element: <Dashboard /> },
//     {path:'/logout',element:<Logout/>},
// ]

const landingRoute: RouteObject[] = [{ path: '/landing', element: <Landing /> }]

// const ecommerceRoutes: RouteObject[] = [
    // { path: '/products', element: <ProductList /> },
    // { path: '/products-grid', element: <ProductGrid /> },
    // { path: '/products/1', element: <ProductDetails /> },
    // { path: '/add-product', element: <AddProduct /> },
    // { path: '/categories', element: <Categories /> },
    // { path: '/orders', element: <Orders /> },
    // { path: '/orders/1', element: <OrderDetails /> },
    // { path: '/customers', element: <Customers /> },
    // { path: '/sellers', element: <Sellers /> },
    // { path: '/sellers/1', element: <SellerDetails /> },
    // { path: '/reviews', element: <Reviews /> },
// ]

// const appsRoutes: RouteObject[] = [
    // { path: '/inbox', element: <Inbox /> },
    // { path: '/inbox/1', element: <InboxDetails /> },
    // { path: '/email-compose', element: <EmailCompose /> },
    // { path: '/email-templates', element: <EmailTemplates /> },

    // { path: '/users/profile', element: <Profile /> },
    // // { path: '/users/contacts', element: <UserContacts /> },
    // { path: '/parametres/utilisateurs', element: <Utilisateurs /> },
    // // { path: '/users/permissions', element: <Permissions /> },
    // { path: '/parametres/profiles', element: <Profiles /> },
    // { path: '/menu/Chauffeurs', element: <Chaufeurs /> },
    // { path: '/menu/vehicules', element: <Vehicules /> },
    // { path: '/historique_demande', element: <Hostorique_demandes /> },

    // { path: '/crm/contacts', element: <Contacts /> },
    // { path: '/crm/opportunities', element: <Opportunities /> },
    // { path: '/crm/deals', element: <Deals /> },
    // { path: '/crm/leads', element: <Leads /> },
    // { path: '/crm/pipeline', element: <Pipeline /> },
    // { path: '/crm/campaign', element: <Campaign /> },
    // { path: '/crm/proposals', element: <Proposals /> },
    // { path: '/crm/estimations', element: <Estimations /> },
    // { path: '/crm/customers', element: <CrmCustomers /> },
    // { path: '/crm/activities', element: <Activities /> },

    // { path: '/file-manager', element: <FileManager /> },
    // { path: '/chat', element: <Chat /> },
    // { path: '/calendar', element: <Calendar /> },

    // { path: '/planification', element: <Planification /> },
    // {path:'/missions',element:<Missions />},
    // { path: '/demande', element: <InvoiceList /> },
    // { path: '/demande/1', element: <InvoiceDetails /> },
    // { path: '/add-demande', element: <AddInvoice /> },
    // { path: '/creer-demande', element: <Creer_demande /> },
    // { path: '/tableau-de-bord', element: <ClientDashboard /> },

    // { path: '/voyages', element: <Voyages /> },
    // { path: '/trajets', element: <Trajets /> },

    // { path: '/clients', element: <Clients /> },
    // { path: '/clients/add', element: <AddClient /> },
    // { path: '/clients/edit/:id', element: <EditClient /> },

    // { path: '/api-key', element: <ApiKeys /> },

    // { path: '/tickets-list', element: <TicketList /> },
    // { path: '/ticket-details', element: <TicketDetails /> },
    // { path: '/ticket-create', element: <TicketCreate /> },

    // { path: '/social-feed', element: <SocialFeed /> },
// ]


// const pagesRoutes: RouteObject[] = [
//     // { path: '/pages/faq', element: <Faq /> },
//     // { path: '/pages/pricing', element: <Pricing /> },
//     // { path: '/pages/empty-page', element: <EmptyPage /> },
//     // { path: '/pages/timeline', element: <Timeline /> },
//     // { path: '/pages/search-results', element: <SearchResults /> },
//     // { path: '/pages/terms-conditions', element: <TermsConditions /> },
//     // { path: '/pages/sitemap', element: <Sitemap /> },
// ]

// const miscellaneousRoutes: RouteObject[] = [
//     // { path: '/miscellaneous/nestable-list', element: <NestableList /> },
//     // { path: '/miscellaneous/pdf-viewer', element: <PdfViewer /> },
//     // { path: '/miscellaneous/sweet-alert', element: <SweetAlert /> },
//     // { path: '/miscellaneous/password-meter', element: <PasswordMeter /> },
//     // { path: '/miscellaneous/clipboard', element: <Clipboard /> },
//     // { path: '/miscellaneous/tree-view', element: <TreeView /> },
//     // { path: '/miscellaneous/tour', element: <Tour /> },
// ]

// const layoutRoutes: RouteObject[] = [
//     // { path: '/layouts/scrollable', element: <ScrollableLayout /> },
//     // { path: '/layouts/compact', element: <CompactLayout /> },
//     // { path: '/layouts/boxed', element: <BoxedLayout /> },
//     // { path: '/layouts/horizontal', element: <HorizontalLayout /> },

//     // { path: '/layouts/sidebars/compact', element: <SidebarCompact /> },
//     // { path: '/layouts/sidebars/icon-view', element: <SidebarIconView /> },
//     // { path: '/layouts/sidebars/on-hover', element: <SidebarOnHover /> },
//     // { path: '/layouts/sidebars/on-hover-active', element: <SidebarOnHoverActive /> },
//     // { path: '/layouts/sidebars/offcanvas', element: <SidebarOffcanvas /> },
//     // { path: '/layouts/sidebars/no-icons-with-lines', element: <SidebarNoIconsLines /> },
//     // { path: '/layouts/sidebars/with-lines', element: <SidebarWithLines /> },
//     // { path: '/layouts/sidebars/light', element: <SidebarLight /> },
//     // { path: '/layouts/sidebars/gradient', element: <SidebarGradient /> },
//     // { path: '/layouts/sidebars/gray', element: <SidebarGray /> },
//     // { path: '/layouts/sidebars/image', element: <SidebarImage /> },

//     // { path: '/layouts/topbars/dark', element: <TopbarDark /> },
//     // { path: '/layouts/topbars/gray', element: <TopbarGray /> },
//     // { path: '/layouts/topbars/gradient', element: <TopbarGradient /> },
// ]

// const uiRoutes: RouteObject[] = [
//     // { path: '/ui/accordions', element: <Accordions /> },
//     // { path: '/ui/alerts', element: <Alerts /> },
//     // { path: '/ui/images', element: <Images /> },
//     // { path: '/ui/badges', element: <Badges /> },
//     // { path: '/ui/breadcrumb', element: <Breadcrumb /> },
//     // { path: '/ui/buttons', element: <Buttons /> },
//     // { path: '/ui/cards', element: <Cards /> },
//     // { path: '/ui/carousel', element: <Carousel /> },
//     // { path: '/ui/collapse', element: <Collapse /> },
//     // { path: '/ui/colors', element: <Colors /> },
//     // { path: '/ui/dropdowns', element: <Dropdowns /> },
//     // { path: '/ui/videos', element: <Videos /> },
//     // { path: '/ui/grid', element: <Grid /> },
//     // { path: '/ui/links', element: <Links /> },
//     // { path: '/ui/list-group', element: <ListGroup /> },
//     // { path: '/ui/modals', element: <Modals /> },
//     // { path: '/ui/notifications', element: <Notifications /> },
//     // { path: '/ui/offcanvas', element: <Offcanvas /> },
//     // { path: '/ui/placeholders', element: <Placeholders /> },
//     // { path: '/ui/pagination', element: <Pagination /> },
//     // { path: '/ui/popovers', element: <Popovers /> },
//     // { path: '/ui/progress', element: <Progress /> },
//     // { path: '/ui/spinners', element: <Spinners /> },
//     // { path: '/ui/tabs', element: <Tabs /> },
//     // { path: '/ui/tooltips', element: <Tooltips /> },
//     // { path: '/ui/typography', element: <Typography /> },
//     // { path: '/ui/utilities', element: <Utilities /> },
// ]

// const componentRoutes: RouteObject[] = [
//     { path: '/widgets', element: <Widgets /> },
// ]

// const graphRoutes: RouteObject[] = [
//     // { path: '/charts/apex/area', element: <ApexArea /> },
//     // { path: '/charts/apex/bar', element: <ApexBar /> },
//     // { path: '/charts/apex/bubble', element: <ApexBubble /> },
//     // { path: '/charts/apex/candlestick', element: <ApexCandlestick /> },
//     // { path: '/charts/apex/column', element: <ApexColumn /> },
//     // { path: '/charts/apex/heatmap', element: <ApexHeatmap /> },
//     // { path: '/charts/apex/line', element: <ApexLine /> },
//     // { path: '/charts/apex/mixed', element: <ApexMixed /> },
//     // { path: '/charts/apex/timeline', element: <ApexTimeline /> },
//     // { path: '/charts/apex/boxplot', element: <ApexBoxplot /> },
//     // { path: '/charts/apex/treemap', element: <ApexTreemap /> },
//     // { path: '/charts/apex/pie', element: <ApexPie /> },
//     // { path: '/charts/apex/radar', element: <ApexRadar /> },
//     // { path: '/charts/apex/radialbar', element: <ApexRadialbar /> },
//     // { path: '/charts/apex/scatter', element: <ApexScatter /> },
//     // { path: '/charts/apex/polar-area', element: <ApexPolarArea /> },
//     // { path: '/charts/apex/sparklines', element: <ApexSparklines /> },
//     // { path: '/charts/apex/range', element: <ApexRange /> },
//     // { path: '/charts/apex/funnel', element: <ApexFunnel /> },
//     // { path: '/charts/apex/slope', element: <ApexSlope /> },

//     // { path: '/charts/chartjs/area', element: <AreaChartjsCharts /> },
//     // { path: '/charts/chartjs/bar', element: <BarChartjsCharts /> },
//     // { path: '/charts/chartjs/line', element: <LineChartjsCharts /> },
//     // { path: '/charts/chartjs/other', element: <OtherChartjsCharts /> },

//     // { path: '/charts/apex-tree', element: <ApexTree /> },
// ]

// const formRoutes: RouteObject[] = [
//     // { path: '/forms/basic', element: <BasicElements /> },
//     // { path: '/forms/pickers', element: <Pickers /> },
//     // { path: '/forms/select', element: <Select /> },
//     // { path: '/forms/validation', element: <Validation /> },
//     // { path: '/forms/wizard', element: <Wizard /> },
//     // { path: '/forms/file-uploads', element: <FileUploads /> },
//     // { path: '/forms/editors', element: <TextEditors /> },
//     // { path: '/forms/slider', element: <Slider /> },
//     // { path: '/forms/layouts', element: <Layouts /> },
//     // { path: '/forms/other-plugins', element: <OtherPlugins /> },
// ]

// const tableRoutes: RouteObject[] = [
//     // { path: '/tables/tanstack', element: <TanstackTables /> },
//     // { path: '/tables/static', element: <StaticTables /> },
//     // { path: '/tables/data-tables/basic', element: <BasicDataTable /> },
//     // { path: '/tables/data-tables/export-data', element: <ExportDataTable /> },
//     // { path: '/tables/data-tables/select', element: <SelectDataTable /> },
//     // { path: '/tables/data-tables/ajax', element: <AjaxDataTable /> },
//     // { path: '/tables/data-tables/javascript-source', element: <JavaScriptSourceDataTable /> },
//     // { path: '/tables/data-tables/data-rendering', element: <DataRenderingDataTable /> },
//     // { path: '/tables/data-tables/scroll', element: <ScrollDataTable /> },
//     // { path: '/tables/data-tables/columns', element: <ColumnsDataTable /> },
//     // { path: '/tables/data-tables/child-rows', element: <ChildRowsDataTable /> },
//     // { path: '/tables/data-tables/column-searching', element: <ColumnSearchDataTable /> },
//     // { path: '/tables/data-tables/fixed-header', element: <FixedHeaderDataTable /> },
//     // { path: '/tables/data-tables/add-rows', element: <AddRowsDataTable /> },
//     // { path: '/tables/data-tables/checkbox-select', element: <CheckboxSelectDataTable /> },
// ]

// const iconRoutes: RouteObject[] = [
//     // { path: '/icons/flags', element: <Flags /> },
//     // { path: '/icons/lucide', element: <LucideIcons /> },
//     // { path: '/icons/tabler', element: <TablerIcons /> },
// ]

// const mapRoutes: RouteObject[] = [
//     // { path: '/maps/vector', element: <VectorMap /> },
//     // { path: '/maps/leaflet', element: <LeafletMap /> },
// ]

// const allRoutes: RouteObject[] = [
//     {
//         element: <MainLayout />,
//         children: [
//             {
//                 path: '/',
//                 element: <Navigate to="/login" replace />,
//             },
//             ...dashboardRoutes,
//             ...ecommerceRoutes,
//             ...appsRoutes,
//             ...pagesRoutes,
//             ...miscellaneousRoutes,
//             ...layoutRoutes,
//             ...uiRoutes,
//             ...componentRoutes,
//             ...graphRoutes,
//             ...formRoutes,
//             ...tableRoutes,
//             ...iconRoutes,
//             ...mapRoutes,
//         ],
//     },
// ]

const otherRoutes: RouteObject[] = [...errorRoutes, ...landingRoute, ...otherPagesRoutes]

// export const routes: RouteObject[] = [
//     { element: <AuthRoute />, children: authRoutes },
//     { element: <ProtectedRoute />, children: allRoutes },
//     ...otherRoutes,
// ]

const adminRoutes: RouteObject[] = [
    {path: '/dashboard', element: <Dashboard /> },
    { path: '/planification', element: <Planification /> },
    {path:'/missions',element:<Missions />},
    { path: '/demande', element: <InvoiceList /> },
    { path: '/demande/1', element: <InvoiceDetails /> },
    { path: '/add-demande', element: <AddInvoice /> },

    // { path: '/voyages', element: <Voyages /> },
    { path: '/trajets', element: <Trajets /> },
    { path: '/clients', element: <Clients /> },
    {path:'/historique',element:<Historique />},
    {path:'/demande-reservation',element:<DemandeReservation />},
    {path:'/depots',element:<Depot />},
    { path: '/announces', element: <Announce /> },
    { path: '/boutiques', element: <Boutiques /> },
    { path: '/clients/add', element: <AddClient /> },
    { path: '/clients/edit/:id', element: <EditClient /> },
    // { path: '/users/contacts', element: <UserContacts /> },
    { path: '/parametres/utilisateurs', element: <Utilisateurs /> },
    // { path: '/users/permissions', element: <Permissions /> },
    { path: '/parametres/profiles', element: <Profiles /> },
    { path: '/menu/Chauffeurs', element: <Chaufeurs /> },
    { path: '/menu/vehicules', element: <Vehicules /> },
]
const clientRoutes: RouteObject[] = [
       { path: '/parametres/profiles', element: <Profiles /> },
    { path: '/tableau-de-bord', element: <ClientDashboard /> },
    { path: '/historique_demande', element: <Hostorique_demandes /> },
    { path: '/creer-demande', element: <Creer_demande /> },

]

export const routes: RouteObject[] = [
  { element: <AuthRoute />, children: authRoutes },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            element: <AdminRoute />,
            children: adminRoutes,
          },
          {
            element: <ClientRoute />,
            children: clientRoutes,
          },
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {path:'/logout',element:<Logout/>},
      { path: '/users/profile', element: <Profile /> },
        ],
      },
    ],
  },
  ...otherRoutes,
]
