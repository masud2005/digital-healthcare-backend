import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path";

expand(config({ path: path.resolve(process.cwd(), ".env") }));

export interface CloverChargeResult {
    id: string;
    amount: number;
    currency: string;
    status: string;
    last4: string;
    brand: string;
}

@Injectable()
export class CloverService {
    private readonly logger = new Logger(CloverService.name);

    private readonly apiKey: string; // Private key → charges, refunds
    private readonly pakmsKey: string; // Public key  → card tokenization
    private readonly merchantId: string;
    private readonly baseUrl: string; // for charges, refunds
    private readonly tokenBaseUrl: string; // for tokenization (different domain!)

    constructor() {
        this.apiKey = process.env.CLOVER_API_KEY || "";
        this.pakmsKey = process.env.CLOVER_PAKMS_KEY || "";
        this.merchantId = process.env.CLOVER_MERCHANT_ID || "";
        const rawBaseUrl = process.env.CLOVER_BASE_URL || "https://scl-sandbox.dev.clover.com";

        // Auto-correct to SCL domain for Ecommerce API if user provided the generic API domain
        if (rawBaseUrl.includes("apisandbox")) {
            this.baseUrl = "https://scl-sandbox.dev.clover.com";
        } else if (rawBaseUrl === "https://api.clover.com") {
            this.baseUrl = "https://scl.clover.com";
        } else {
            this.baseUrl = rawBaseUrl;
        }

        // Clover tokenization uses a DIFFERENT base URL than charges
        // Sandbox:    https://token-sandbox.dev.clover.com
        // Production: https://token.clover.com
        if (process.env.CLOVER_TOKEN_URL) {
            this.tokenBaseUrl = process.env.CLOVER_TOKEN_URL;
        } else if (this.baseUrl.includes("sandbox")) {
            this.tokenBaseUrl = "https://token-sandbox.dev.clover.com";
        } else {
            this.tokenBaseUrl = "https://token.clover.com";
        }

        this.logger.debug(
            `🔧 Clover initialized | Charge: ${this.baseUrl} | Token: ${this.tokenBaseUrl}`,
        );

        if (!this.apiKey)
            this.logger.warn("⚠️  CLOVER_API_KEY (private) is not set. Charges/refunds will fail.");
        if (!this.pakmsKey)
            this.logger.warn(
                "⚠️  CLOVER_PAKMS_KEY (public) is not set. Card tokenization will fail.",
            );
        if (!this.merchantId) this.logger.warn("⚠️  CLOVER_MERCHANT_ID is not set.");
    }

    /**
     * Step 1: Tokenize raw card data via Clover Ecommerce API.
     * Returns a single-use token (source) that can be charged.
     */
    async tokenizeCard(cardData: {
        cardNumber: string;
        expiredDate: string; // MM/YY format
        cvv: string;
        cardHolderName: string;
    }): Promise<string> {
        const [expMonth, expYear] = cardData.expiredDate.split("/").map((s) => s.trim());

        // Clover requires at least firstname and lastname (2 words)
        const formattedName = cardData.cardHolderName.trim();
        const finalName = formattedName.includes(" ") ? formattedName : `${formattedName} User`;

        const payload = {
            card: {
                number: cardData.cardNumber.replace(/\s+/g, ""),
                exp_month: expMonth,
                exp_year: `20${expYear}`,
                cvv: cardData.cvv,
                name: finalName,
            },
        };

        this.logger.debug(`🔐 Tokenizing card for: ${cardData.cardHolderName}`);
        this.logger.debug(`📡 Token URL: ${this.tokenBaseUrl}/v1/tokens`);

        const response = await fetch(`${this.tokenBaseUrl}/v1/tokens`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: this.pakmsKey, // Public key (PAKMS) for tokenization
            },
            body: JSON.stringify(payload),
        });

        const data = (await response.json()) as any;

        if (!response.ok) {
            this.logger.error("Clover tokenization failed", data);
            const message = data?.message || data?.error?.message || "Card tokenization failed.";
            throw new UnprocessableEntityException(`Payment error: ${message}`);
        }

        const token = data?.id || data?.token;
        if (!token) {
            throw new UnprocessableEntityException("Card tokenization failed: No token returned.");
        }

        this.logger.debug(`✅ Card tokenized successfully.`);
        return token;
    }

    /**
     * Step 2: Charge the tokenized card via Clover Ecommerce API.
     * Amount is in USD cents (e.g. $10.00 = 1000).
     */
    async chargeCard(params: {
        token: string;
        amountInCents: number;
        description?: string;
        currency?: string;
    }): Promise<CloverChargeResult> {
        const { token, amountInCents, description, currency = "usd" } = params;

        const payload = {
            amount: amountInCents,
            currency,
            source: token,
            description: description || "Doc App Payment",
            capture: true,
        };

        this.logger.debug(`💳 Charging card: $${(amountInCents / 100).toFixed(2)}`);

        const response = await fetch(`${this.baseUrl}/v1/charges`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        const data = (await response.json()) as any;

        if (!response.ok) {
            this.logger.error("Clover charge failed", data);
            const message = data?.message || data?.error?.message || "Payment charge failed.";
            throw new UnprocessableEntityException(`Payment error: ${message}`);
        }

        const chargeId = data?.id;
        if (!chargeId) {
            throw new UnprocessableEntityException(
                "Charge failed: No charge ID returned from Clover.",
            );
        }

        this.logger.log(`✅ Clover charge successful. ID: ${chargeId}`);

        return {
            id: chargeId,
            amount: data.amount,
            currency: data.currency,
            status: data.status,
            last4: data?.source?.last4 || "",
            brand: data?.source?.brand || "",
        };
    }

    /**
     * Convenience method: Tokenize then Charge in one call.
     * Returns the full charge result.
     */
    async tokenizeAndCharge(params: {
        cardNumber: string;
        expiredDate: string;
        cvv: string;
        cardHolderName: string;
        totalAmountUSD: number;
        description?: string;
    }): Promise<CloverChargeResult> {
        // Step 1: Tokenize
        const token = await this.tokenizeCard({
            cardNumber: params.cardNumber,
            expiredDate: params.expiredDate,
            cvv: params.cvv,
            cardHolderName: params.cardHolderName,
        });

        // Step 2: Convert USD to cents (Clover uses cents)
        const amountInCents = Math.round(params.totalAmountUSD * 100);

        // Step 3: Charge
        return this.chargeCard({
            token,
            amountInCents,
            description: params.description,
        });
    }

    /**
     * Tokenize a card and save it as a reusable Clover card token.
     * The returned token can be stored and reused for recurring billing.
     */
    async createReusableCardToken(cardData: {
        cardNumber: string;
        expiredDate: string;
        cvv: string;
        cardHolderName: string;
    }): Promise<string> {
        return this.tokenizeCard(cardData);
    }

    /**
     * Charge a previously saved Clover card token.
     * Used for recurring billing cycles without re-entering card details.
     */
    async chargeWithSavedToken(params: {
        savedToken: string;
        totalAmountUSD: number;
        description?: string;
    }): Promise<CloverChargeResult> {
        const amountInCents = Math.round(params.totalAmountUSD * 100);

        return this.chargeCard({
            token: params.savedToken,
            amountInCents,
            description: params.description || "Doc App Recurring Payment",
        });
    }

    /**
     * Issue a refund for a previously completed Clover charge.
     * @param chargeId   — the Clover charge ID (transactionId stored in Payment table)
     * @param amountUSD  — amount to refund in USD. If omitted, a full refund is issued.
     * @returns          — Clover refund ID (gatewayRefundId)
     */
    async refundCharge(chargeId: string, amountUSD?: number): Promise<string> {
        const payload: Record<string, any> = { charge: chargeId };

        if (amountUSD !== undefined) {
            payload.amount = Math.round(amountUSD * 100); // convert to cents
        }

        this.logger.debug(
            `💸 Issuing refund for charge ${chargeId}${amountUSD ? ` — $${amountUSD}` : " (full)"}`,
        );

        const response = await fetch(`${this.baseUrl}/v1/refunds`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        const data = (await response.json()) as any;

        if (!response.ok) {
            this.logger.error("Clover refund failed", data);
            const message = data?.message || data?.error?.message || "Refund failed.";
            throw new Error(`Clover refund error: ${message}`);
        }

        const refundId = data?.id;
        if (!refundId) {
            throw new Error("Refund failed: No refund ID returned from Clover.");
        }

        this.logger.log(`✅ Clover refund successful. Refund ID: ${refundId}`);
        return refundId;
    }
}
