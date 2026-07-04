import { MailService } from "@global/mail/mail.service";
import { PrismaService } from "@global/prisma/prisma.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class MailQueueService {
    private readonly logger = new Logger(MailQueueService.name);
    private isProcessing = false;

    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
    ) {}

    /**
     * Add a mail to the queue (to be processed by the cron job)
     */
    async queueMail(to: string, subject: string, body: string) {
        try {
            await this.prisma.mailQueue.create({
                data: {
                    to,
                    subject,
                    body,
                },
            });
            this.logger.log(`Queued email to ${to} with subject: "${subject}"`);
        } catch (error) {
            this.logger.error(`Failed to queue email to ${to}`, error as Error);
        }
    }

    /**
     * Process pending and failed messages every 2 hours
     */
    @Cron(CronExpression.EVERY_2_HOURS)
    async handleCron() {
        this.logger.debug("Running scheduled mail queue check...");
        await this.processQueue();
    }

    /**
     * Processes pending and eligible failed messages
     */
    async processQueue() {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        try {
            // Find messages that are pending OR failed with attempts < 3
            const jobs = await this.prisma.mailQueue.findMany({
                where: {
                    OR: [
                        { status: "pending" },
                        {
                            status: "failed",
                            attempts: { lt: 3 },
                        },
                    ],
                },
                orderBy: { createdAt: "asc" },
                take: 10, // Process in batches of 10
            });

            if (jobs.length === 0) {
                this.isProcessing = false;
                return;
            }

            this.logger.log(`Processing ${jobs.length} queued email job(s)...`);

            for (const job of jobs) {
                // Mark job as processing
                await this.prisma.mailQueue.update({
                    where: { id: job.id },
                    data: { status: "processing" },
                });

                try {
                    await this.mailService.sendMail({
                        to: job.to,
                        subject: job.subject,
                        html: job.body,
                    });

                    // Mark as completed
                    await this.prisma.mailQueue.update({
                        where: { id: job.id },
                        data: {
                            status: "completed",
                            attempts: job.attempts + 1,
                            error: null,
                        },
                    });
                    this.logger.log(`Successfully sent email to ${job.to} (Job ID: ${job.id})`);
                } catch (error) {
                    const errorMsg = (error as Error).message || String(error);
                    const nextAttempts = job.attempts + 1;
                    const nextStatus = nextAttempts >= 3 ? "failed" : "pending"; // retry later if attempts < 3

                    await this.prisma.mailQueue.update({
                        where: { id: job.id },
                        data: {
                            status: nextStatus,
                            attempts: nextAttempts,
                            error: errorMsg,
                        },
                    });
                    this.logger.error(
                        `Failed to send email to ${job.to} (Job ID: ${job.id}, Attempt: ${nextAttempts}): ${errorMsg}`,
                    );
                }
            }
        } catch (error) {
            this.logger.error("Error processing mail queue", error as Error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Generates a premium and beautiful HTML template for product newsletter notifications
     */
    getProductTemplate(params: {
        productName: string;
        price: string | null;
        description: string | null;
        categoryName: string;
        slug: string;
        imageUrl?: string | null;
    }): string {
        const { productName, price, description, categoryName, slug, imageUrl } = params;
        const frontendUrl =
            process.env.FRONTEND_URL || "https://client.weightlossmdcherrycreek.com";
        const productUrl = `${frontendUrl}/products/${slug}`;

        const imageHtml = imageUrl
            ? `<div style="text-align: center; margin-bottom: 20px;">
                 <img src="${imageUrl}" alt="${productName}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; display: block; border: 1px solid #2e3d38;" />
               </div>`
            : "";
        const priceTag = price ? `<div class="price-pill">$${price}</div>` : "";
        const descHtml = description
            ? `<div class="content-desc">${description}</div>`
            : "<p>Check out the details on our store website.</p>";

        return this.getBaseHtmlTemplate({
            title: "New Product Release!",
            subtitle: "Exclusively available now on our pharmacy catalog",
            accentLabel: "NEW PRODUCT ALERT",
            bodyHtml: `
                <div class="product-card">
                    ${imageHtml}
                    <span class="category-tag">${categoryName}</span>
                    <h2 class="product-title">${productName}</h2>
                    ${priceTag}
                    ${descHtml}
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="${productUrl}" class="cta-button">View in Store</a>
                    </div>
                </div>
            `,
        });
    }

    /**
     * Generates a premium and beautiful HTML template for blog newsletter notifications
     */
    getBlogTemplate(params: {
        blogTitle: string;
        description: string;
        categoryName: string;
        slug: string;
        imageUrl?: string | null;
    }): string {
        const { blogTitle, description, categoryName, slug, imageUrl } = params;
        const frontendUrl =
            process.env.FRONTEND_URL || "https://client.weightlossmdcherrycreek.com";
        const blogUrl = `${frontendUrl}/blog/${slug}`;

        const imageHtml = imageUrl
            ? `<div style="text-align: center; margin-bottom: 20px;">
                 <img src="${imageUrl}" alt="${blogTitle}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; display: block; border: 1px solid #2e3d38;" />
               </div>`
            : "";

        return this.getBaseHtmlTemplate({
            title: "New Article Published",
            subtitle: "Insights and updates from our medical experts",
            accentLabel: "READ THE BLOG",
            bodyHtml: `
                <div class="product-card">
                    ${imageHtml}
                    <span class="category-tag">${categoryName}</span>
                    <h2 class="product-title">${blogTitle}</h2>
                    <div class="content-desc">${description}</div>
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="${blogUrl}" class="cta-button">Read Article</a>
                    </div>
                </div>
            `,
        });
    }

    /**
     * The master HTML skeleton containing vibrant responsive design rules matching brand identity
     */
    private getBaseHtmlTemplate(options: {
        title: string;
        subtitle: string;
        accentLabel: string;
        bodyHtml: string;
    }): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f3f7f5;
      margin: 0;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1b2622;
      border-radius: 24px;
      overflow: hidden;
      color: #ffffff;
      box-shadow: 0 20px 50px rgba(27, 38, 34, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #2c615b 0%, #1c3d39 100%);
      padding: 48px 40px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #dcb37b 0%, #b28a50 100%);
    }
    .accent-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #dcb37b;
      background-color: rgba(220, 179, 123, 0.15);
      padding: 6px 14px;
      border-radius: 50px;
      margin-bottom: 16px;
    }
    .header-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 10px 0;
      color: #ffffff;
      line-height: 1.25;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      font-size: 15px;
      line-height: 1.6;
      color: #c4d9d3;
      margin: 0;
    }
    .content {
      padding: 40px;
    }
    .product-card {
      background-color: #212c29;
      border: 1px solid #2e3d38;
      border-radius: 20px;
      padding: 30px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .category-tag {
      font-size: 11px;
      font-weight: bold;
      color: #8a9b96;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      display: block;
      margin-bottom: 8px;
    }
    .product-title {
      font-size: 22px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .price-pill {
      display: inline-block;
      font-size: 20px;
      font-weight: 700;
      color: #1b2622;
      background: linear-gradient(135deg, #e3c091 0%, #dcb37b 100%);
      padding: 6px 18px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(220, 179, 123, 0.25);
    }
    .content-desc {
      font-size: 15px;
      line-height: 1.7;
      color: #b9cfc9;
      margin-top: 10px;
    }
    .content-desc p {
      margin-bottom: 12px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #dcb37b 0%, #c49c66 100%);
      color: #1b2622 !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: bold;
      padding: 16px 36px;
      border-radius: 50px;
      box-shadow: 0 6px 20px rgba(220, 179, 123, 0.2);
      transition: all 0.3s ease;
    }
    .footer {
      padding: 0 40px 40px 40px;
      text-align: center;
    }
    .footer-inner {
      border-top: 1px solid #2a3532;
      padding-top: 24px;
      font-size: 13px;
      color: #6b8880;
      line-height: 1.7;
    }
    .footer-inner a {
      color: #dcb37b;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      body { padding: 20px 10px; }
      .header { padding: 36px 24px; }
      .header-title { font-size: 24px; }
      .content { padding: 24px; }
      .product-card { padding: 20px; }
      .footer { padding: 0 24px 32px 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="accent-tag">${options.accentLabel}</span>
      <h1 class="header-title">${options.title}</h1>
      <p class="header-subtitle">${options.subtitle}</p>
    </div>
    <div class="content">
      ${options.bodyHtml}
    </div>
    <div class="footer">
      <div class="footer-inner">
        WeightLossMD Support &bull;
        <a href="mailto:support@weightlossmd.com">support@weightlossmd.com</a><br>
        This email was sent to you because you subscribed to our newsletter.<br>
        <a href="https://weightlossmd.com/unsubscribe">Unsubscribe</a> from this list.
      </div>
    </div>
  </div>
</body>
</html>`;
    }
}
