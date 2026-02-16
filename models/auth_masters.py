# Master Data for Authentication System

USER_ROLES = [
    {"code": "founder", "name": "Founder"},
    {"code": "ceo_md", "name": "CEO/MD"},
    {"code": "cfo", "name": "CFO"},
    {"code": "coo", "name": "COO"},
    {"code": "head_sales", "name": "Head of Sales"},
    {"code": "accountant", "name": "Accountant / CA / CPA"},
    {"code": "hr_head", "name": "HR Head"},
    {"code": "operations_manager", "name": "Operations Manager"},
    {"code": "consultant", "name": "Consultant"},
    {"code": "other", "name": "Other"}
]

INDUSTRIES = [
    {"code": "saas_it", "name": "SaaS / IT"},
    {"code": "manufacturing", "name": "Manufacturing"},
    {"code": "retail", "name": "Retail"},
    {"code": "ecommerce", "name": "Ecommerce"},
    {"code": "trading_distribution", "name": "Trading / Distribution"},
    {"code": "logistics", "name": "Logistics"},
    {"code": "healthcare_pharma", "name": "Healthcare / Pharma"},
    {"code": "education", "name": "Education"},
    {"code": "real_estate", "name": "Real Estate"},
    {"code": "professional_services", "name": "Professional Services"},
    {"code": "bfsi", "name": "BFSI"},
    {"code": "hospitality", "name": "Hospitality"},
    {"code": "ngo_npo", "name": "NGO / NPO"},
    {"code": "public_sector", "name": "Public Sector"},
    {"code": "other", "name": "Other"}
]

COMPANY_SIZES = [
    {"code": "1_10", "name": "1-10"},
    {"code": "11_50", "name": "11-50"},
    {"code": "51_200", "name": "51-200"},
    {"code": "201_500", "name": "201-500"},
    {"code": "501_1000", "name": "501-1000"},
    {"code": "1000_plus", "name": "1000+"}
]

BUSINESS_TYPES = [
    {"code": "individual", "name": "Individual"},
    {"code": "partnership", "name": "Partnership"},
    {"code": "private_limited", "name": "Private Limited / LLC"},
    {"code": "public_limited", "name": "Public Limited"},
    {"code": "llp", "name": "LLP"},
    {"code": "ngo_trust", "name": "NGO / Trust"},
    {"code": "government", "name": "Government"},
    {"code": "other", "name": "Other"}
]

COUNTRIES = [
    {"code": "IN", "name": "India", "dial_code": "+91", "currency_code": "INR"},
    {"code": "US", "name": "United States", "dial_code": "+1", "currency_code": "USD"},
    {"code": "GB", "name": "United Kingdom", "dial_code": "+44", "currency_code": "GBP"},
    {"code": "CA", "name": "Canada", "dial_code": "+1", "currency_code": "CAD"},
    {"code": "AU", "name": "Australia", "dial_code": "+61", "currency_code": "AUD"},
    {"code": "AE", "name": "United Arab Emirates", "dial_code": "+971", "currency_code": "AED"},
    {"code": "SG", "name": "Singapore", "dial_code": "+65", "currency_code": "SGD"},
    {"code": "MY", "name": "Malaysia", "dial_code": "+60", "currency_code": "MYR"},
    {"code": "TH", "name": "Thailand", "dial_code": "+66", "currency_code": "THB"},
    {"code": "PH", "name": "Philippines", "dial_code": "+63", "currency_code": "PHP"},
    {"code": "ID", "name": "Indonesia", "dial_code": "+62", "currency_code": "IDR"},
    {"code": "VN", "name": "Vietnam", "dial_code": "+84", "currency_code": "VND"},
    {"code": "BD", "name": "Bangladesh", "dial_code": "+880", "currency_code": "BDT"},
    {"code": "PK", "name": "Pakistan", "dial_code": "+92", "currency_code": "PKR"},
    {"code": "LK", "name": "Sri Lanka", "dial_code": "+94", "currency_code": "LKR"},
    {"code": "NP", "name": "Nepal", "dial_code": "+977", "currency_code": "NPR"},
    {"code": "DE", "name": "Germany", "dial_code": "+49", "currency_code": "EUR"},
    {"code": "FR", "name": "France", "dial_code": "+33", "currency_code": "EUR"},
    {"code": "ES", "name": "Spain", "dial_code": "+34", "currency_code": "EUR"},
    {"code": "IT", "name": "Italy", "dial_code": "+39", "currency_code": "EUR"},
    {"code": "NL", "name": "Netherlands", "dial_code": "+31", "currency_code": "EUR"},
    {"code": "SE", "name": "Sweden", "dial_code": "+46", "currency_code": "SEK"},
    {"code": "NO", "name": "Norway", "dial_code": "+47", "currency_code": "NOK"},
    {"code": "DK", "name": "Denmark", "dial_code": "+45", "currency_code": "DKK"},
    {"code": "FI", "name": "Finland", "dial_code": "+358", "currency_code": "EUR"},
    {"code": "JP", "name": "Japan", "dial_code": "+81", "currency_code": "JPY"},
    {"code": "KR", "name": "South Korea", "dial_code": "+82", "currency_code": "KRW"},
    {"code": "CN", "name": "China", "dial_code": "+86", "currency_code": "CNY"},
    {"code": "HK", "name": "Hong Kong", "dial_code": "+852", "currency_code": "HKD"},
    {"code": "TW", "name": "Taiwan", "dial_code": "+886", "currency_code": "TWD"},
    {"code": "BR", "name": "Brazil", "dial_code": "+55", "currency_code": "BRL"},
    {"code": "MX", "name": "Mexico", "dial_code": "+52", "currency_code": "MXN"},
    {"code": "AR", "name": "Argentina", "dial_code": "+54", "currency_code": "ARS"},
    {"code": "CL", "name": "Chile", "dial_code": "+56", "currency_code": "CLP"},
    {"code": "CO", "name": "Colombia", "dial_code": "+57", "currency_code": "COP"},
    {"code": "ZA", "name": "South Africa", "dial_code": "+27", "currency_code": "ZAR"},
    {"code": "NG", "name": "Nigeria", "dial_code": "+234", "currency_code": "NGN"},
    {"code": "KE", "name": "Kenya", "dial_code": "+254", "currency_code": "KES"},
    {"code": "EG", "name": "Egypt", "dial_code": "+20", "currency_code": "EGP"},
    {"code": "SA", "name": "Saudi Arabia", "dial_code": "+966", "currency_code": "SAR"},
    {"code": "IL", "name": "Israel", "dial_code": "+972", "currency_code": "ILS"},
    {"code": "TR", "name": "Turkey", "dial_code": "+90", "currency_code": "TRY"},
    {"code": "RU", "name": "Russia", "dial_code": "+7", "currency_code": "RUB"},
    {"code": "PL", "name": "Poland", "dial_code": "+48", "currency_code": "PLN"},
    {"code": "NZ", "name": "New Zealand", "dial_code": "+64", "currency_code": "NZD"}
]

LANGUAGES = [
    {"code": "en", "name": "English"},
    {"code": "hi", "name": "Hindi"},
    {"code": "es", "name": "Spanish"},
    {"code": "fr", "name": "French"},
    {"code": "de", "name": "German"},
    {"code": "ar", "name": "Arabic"},
    {"code": "zh", "name": "Chinese"},
    {"code": "ja", "name": "Japanese"},
    {"code": "ko", "name": "Korean"},
    {"code": "pt", "name": "Portuguese"},
    {"code": "ru", "name": "Russian"},
    {"code": "it", "name": "Italian"},
    {"code": "nl", "name": "Dutch"},
    {"code": "pl", "name": "Polish"},
    {"code": "tr", "name": "Turkish"},
    {"code": "vi", "name": "Vietnamese"},
    {"code": "th", "name": "Thai"},
    {"code": "id", "name": "Indonesian"},
    {"code": "ms", "name": "Malay"},
    {"code": "bn", "name": "Bengali"}
]

TIMEZONES = [
    {"code": "UTC", "name": "UTC", "offset": "+00:00"},
    {"code": "Asia/Kolkata", "name": "Asia/Kolkata (IST)", "offset": "+05:30"},
    {"code": "America/New_York", "name": "America/New_York (EST/EDT)", "offset": "-05:00"},
    {"code": "America/Los_Angeles", "name": "America/Los_Angeles (PST/PDT)", "offset": "-08:00"},
    {"code": "America/Chicago", "name": "America/Chicago (CST/CDT)", "offset": "-06:00"},
    {"code": "America/Denver", "name": "America/Denver (MST/MDT)", "offset": "-07:00"},
    {"code": "Europe/London", "name": "Europe/London (GMT/BST)", "offset": "+00:00"},
    {"code": "Europe/Paris", "name": "Europe/Paris (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Berlin", "name": "Europe/Berlin (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Madrid", "name": "Europe/Madrid (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Rome", "name": "Europe/Rome (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Amsterdam", "name": "Europe/Amsterdam (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Stockholm", "name": "Europe/Stockholm (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Oslo", "name": "Europe/Oslo (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Copenhagen", "name": "Europe/Copenhagen (CET/CEST)", "offset": "+01:00"},
    {"code": "Europe/Helsinki", "name": "Europe/Helsinki (EET/EEST)", "offset": "+02:00"},
    {"code": "Europe/Moscow", "name": "Europe/Moscow (MSK)", "offset": "+03:00"},
    {"code": "Asia/Dubai", "name": "Asia/Dubai (GST)", "offset": "+04:00"},
    {"code": "Asia/Singapore", "name": "Asia/Singapore (SGT)", "offset": "+08:00"},
    {"code": "Asia/Hong_Kong", "name": "Asia/Hong_Kong (HKT)", "offset": "+08:00"},
    {"code": "Asia/Tokyo", "name": "Asia/Tokyo (JST)", "offset": "+09:00"},
    {"code": "Asia/Seoul", "name": "Asia/Seoul (KST)", "offset": "+09:00"},
    {"code": "Asia/Shanghai", "name": "Asia/Shanghai (CST)", "offset": "+08:00"},
    {"code": "Asia/Bangkok", "name": "Asia/Bangkok (ICT)", "offset": "+07:00"},
    {"code": "Asia/Jakarta", "name": "Asia/Jakarta (WIB)", "offset": "+07:00"},
    {"code": "Asia/Manila", "name": "Asia/Manila (PHT)", "offset": "+08:00"},
    {"code": "Asia/Kuala_Lumpur", "name": "Asia/Kuala_Lumpur (MYT)", "offset": "+08:00"},
    {"code": "Asia/Ho_Chi_Minh", "name": "Asia/Ho_Chi_Minh (ICT)", "offset": "+07:00"},
    {"code": "Asia/Dhaka", "name": "Asia/Dhaka (BST)", "offset": "+06:00"},
    {"code": "Asia/Karachi", "name": "Asia/Karachi (PKT)", "offset": "+05:00"},
    {"code": "Asia/Colombo", "name": "Asia/Colombo (IST)", "offset": "+05:30"},
    {"code": "Asia/Kathmandu", "name": "Asia/Kathmandu (NPT)", "offset": "+05:45"},
    {"code": "Australia/Sydney", "name": "Australia/Sydney (AEST/AEDT)", "offset": "+10:00"},
    {"code": "Australia/Melbourne", "name": "Australia/Melbourne (AEST/AEDT)", "offset": "+10:00"},
    {"code": "Australia/Perth", "name": "Australia/Perth (AWST)", "offset": "+08:00"},
    {"code": "Pacific/Auckland", "name": "Pacific/Auckland (NZST/NZDT)", "offset": "+12:00"},
    {"code": "America/Sao_Paulo", "name": "America/Sao_Paulo (BRT/BRST)", "offset": "-03:00"},
    {"code": "America/Mexico_City", "name": "America/Mexico_City (CST/CDT)", "offset": "-06:00"},
    {"code": "America/Buenos_Aires", "name": "America/Buenos_Aires (ART)", "offset": "-03:00"},
    {"code": "America/Santiago", "name": "America/Santiago (CLT/CLST)", "offset": "-04:00"},
    {"code": "America/Bogota", "name": "America/Bogota (COT)", "offset": "-05:00"},
    {"code": "Africa/Johannesburg", "name": "Africa/Johannesburg (SAST)", "offset": "+02:00"},
    {"code": "Africa/Lagos", "name": "Africa/Lagos (WAT)", "offset": "+01:00"},
    {"code": "Africa/Nairobi", "name": "Africa/Nairobi (EAT)", "offset": "+03:00"},
    {"code": "Africa/Cairo", "name": "Africa/Cairo (EET/EEST)", "offset": "+02:00"},
    {"code": "Asia/Riyadh", "name": "Asia/Riyadh (AST)", "offset": "+03:00"},
    {"code": "Asia/Jerusalem", "name": "Asia/Jerusalem (IST/IDT)", "offset": "+02:00"},
    {"code": "Asia/Istanbul", "name": "Asia/Istanbul (TRT)", "offset": "+03:00"}
]

SOLUTIONS = [
    {
        "code": "commerce",
        "name": "Commerce",
        "description": "Lead → Deal → Order → Delivery → Invoice → Collection",
        "default_enabled": True,
        "can_disable": True
    },
    {
        "code": "workforce",
        "name": "Workforce",
        "description": "Employees, payroll, reimbursements",
        "default_enabled": False,
        "can_disable": True
    },
    {
        "code": "capital",
        "name": "Capital",
        "description": "Banking, treasuries, liquidity",
        "default_enabled": True,
        "can_disable": True
    },
    {
        "code": "operations",
        "name": "Operations",
        "description": "Projects, inventory, assets",
        "default_enabled": False,
        "can_disable": True
    },
    {
        "code": "finance",
        "name": "Finance",
        "description": "GL, Tax, Reconciliation, P&L, BS, Cashflow",
        "default_enabled": True,
        "can_disable": False  # Always enabled, locked
    }
]

INSIGHTS_MODULE = {
    "code": "insights",
    "name": "Insights",
    "description": "Analytics module with dashboards for Cashflow, Profitability, Performance, Planning & Financials",
    "default_enabled": True
}
