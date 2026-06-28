export const DEFAULT_WEBSITE_SETTINGS = {
    title: "Weight Loss MD",
    metaDescription:
        "Weight loss is about more than diet and exercise alone. Weight Loss MD provides medical support to help you overcome these challenges",
    contactInfo: {
        create: {
            phone: "(720) 277-9614",
            email: "info@wlmd.net",
            openHours: "Mon - Fri : 9AM - 2PM, 3PM - 6PM",
            closedDays: "Sat - Sun",
        },
    },
    googleAnalytics: {
        create: {
            gaMeasurementId: "G-XXXXXXXXXX",
        },
    },
    offices: {
        create: [
            {
                name: "Colorado Springs",
                address: "1625 Medical Center Point, Suite 100, Colorado Springs, CO 80907",
                isActive: true,
            },
            {
                name: "Cherry Creek",
                address: "700 S Speer Blvd, Denver, CO 80209",
                isActive: true,
            },
            {
                name: "DTC / Greenwood Village",
                address: "8100 E Union Ave, Suite 104, Denver, CO 80237",
                isActive: true,
            },
            {
                name: "Boulder",
                address: "2425 Canyon Blvd, Suite G, Boulder, CO 80302",
                isActive: true,
            },
        ],
    },
    socialLinks: {
        create: [
            { name: "facebook", url: "https://" },
            { name: "instagram", url: "https://" },
            { name: "twitter", url: "https://" },
            { name: "linkedin", url: "https://" },
        ],
    },
};
