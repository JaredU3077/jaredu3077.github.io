// Codex Data - Comprehensive Financial Knowledge Base
// Contains all 200 layers of financial instruments and control mechanisms

export const CODEX_DATA = {
    layers: {
        1: {
            title: "Basic Instruments",
            description: "Fundamental financial instruments that form the foundation of modern finance.",
            instruments: [
                {
                    name: "Stocks (Equities)",
                    description: "Represent ownership in a company and entitle the holder to a share of the company's profits and assets."
                },
                {
                    name: "Bonds (Debt Securities)",
                    description: "Fixed income instruments where the investor loans money to an entity (corporate or governmental) that borrows the funds for a defined period at a fixed interest rate."
                },
                {
                    name: "Cash and Cash Equivalents",
                    description: "Highly liquid assets that include currency, bank deposits, and Treasury bills."
                }
            ]
        },
        2: {
            title: "Derivative Instruments",
            description: "Complex financial instruments whose value is derived from underlying assets.",
            instruments: [
                {
                    name: "Options",
                    description: "Contracts that give the buyer the right, but not the obligation, to buy or sell an asset at a predetermined price within a specific period."
                },
                {
                    name: "Futures",
                    description: "Standardized contracts obligating the buyer to purchase, or the seller to sell, an asset at a predetermined future date and price."
                },
                {
                    name: "Swaps",
                    description: "Contracts to exchange cash flows or other financial instruments over time, such as interest rate swaps, currency swaps, and commodity swaps."
                },
                {
                    name: "Forward Contracts",
                    description: "Non-standardized contracts between two parties to buy or sell an asset at a specified future date for a price agreed today."
                }
            ]
        },
        3: {
            title: "Hybrid Instruments",
            description: "Financial instruments that combine characteristics of both debt and equity.",
            instruments: [
                {
                    name: "Convertible Bonds",
                    description: "Bonds that can be converted into a predetermined number of the issuer's equity shares."
                },
                {
                    name: "Preferred Stocks",
                    description: "Equity shares that pay dividends at a specified rate and have priority over common stock in dividend payment and liquidation."
                },
                {
                    name: "Exchangeable Bonds",
                    description: "Bonds that can be exchanged for a predetermined number of shares of a different company."
                },
                {
                    name: "Warrants",
                    description: "Securities that entitle the holder to buy the underlying stock of the issuing company at a fixed exercise price until the expiry date."
                }
            ]
        },
        4: {
            title: "Structured Products",
            description: "Complex financial instruments created by combining multiple financial products.",
            instruments: [
                {
                    name: "Mortgage-Backed Securities (MBS)",
                    description: "Pools of mortgages that are sold to investors, offering periodic payments similar to bond coupons."
                },
                {
                    name: "Collateralized Debt Obligations (CDOs)",
                    description: "Structured financial products backed by a pool of loans and other assets and sold to institutional investors."
                },
                {
                    name: "Asset-Backed Securities (ABS)",
                    description: "Securities backed by financial assets other than mortgages, such as credit card receivables, auto loans, or student loans."
                },
                {
                    name: "Structured Notes",
                    description: "Debt securities with embedded derivatives that adjust the security's risk/return profile."
                }
            ]
        },
        5: {
            title: "Complex Derivatives",
            description: "Advanced derivative instruments used for sophisticated risk management and speculation.",
            instruments: [
                {
                    name: "Credit Default Swaps (CDS)",
                    description: "Contracts that transfer the credit exposure of fixed income products between parties."
                },
                {
                    name: "Total Return Swaps",
                    description: "Agreements where one party makes payments based on a set rate, while the other party makes payments based on the return of an underlying asset."
                },
                {
                    name: "Variance Swaps",
                    description: "Over-the-counter financial derivatives used to hedge or speculate on the volatility of an underlying asset."
                },
                {
                    name: "Inflation Swaps",
                    description: "Contracts used to transfer inflation risk from one party to another."
                }
            ]
        },
        6: {
            title: "Alternative Investments",
            description: "Non-traditional investment vehicles that provide diversification and potential for higher returns.",
            instruments: [
                {
                    name: "Private Equity",
                    description: "Investments in private companies or buyouts of public companies that result in a delisting of public equity."
                },
                {
                    name: "Hedge Funds",
                    description: "Pooled funds that employ various strategies to earn active returns for their investors."
                },
                {
                    name: "Real Estate Investment Trusts (REITs)",
                    description: "Companies that own, operate, or finance income-producing real estate."
                },
                {
                    name: "Commodities",
                    description: "Investments in physical commodities like gold, silver, oil, and agricultural products."
                }
            ]
        },
        7: {
            title: "Exotic Instruments",
            description: "Highly specialized financial instruments with unique characteristics and payoffs.",
            instruments: [
                {
                    name: "Weather Derivatives",
                    description: "Financial instruments used by companies or individuals to hedge against the risk of weather-related losses."
                },
                {
                    name: "Catastrophe Bonds",
                    description: "Risk-linked securities that transfer risks from natural disasters to investors."
                },
                {
                    name: "Binary Options",
                    description: "Options with fixed payouts depending on whether the underlying asset exceeds a strike price."
                },
                {
                    name: "Digital Derivatives",
                    description: "Derivatives based on digital assets, such as cryptocurrency options and futures."
                }
            ]
        },
        8: {
            title: "Digital Assets",
            description: "Cryptocurrency and blockchain-based financial instruments.",
            instruments: [
                {
                    name: "Cryptocurrencies",
                    description: "Digital or virtual currencies that use cryptography for security, such as Bitcoin and Ethereum."
                },
                {
                    name: "Stablecoins",
                    description: "Cryptocurrencies pegged to a stable asset like fiat currency."
                },
                {
                    name: "Security Tokens",
                    description: "Digital tokens that represent ownership in a real asset, such as real estate or equity in a company."
                },
                {
                    name: "Non-Fungible Tokens (NFTs)",
                    description: "Unique digital assets representing ownership of a specific item or piece of content."
                }
            ]
        },
        9: {
            title: "Sustainable Investments",
            description: "Financial instruments focused on environmental, social, and governance (ESG) criteria.",
            instruments: [
                {
                    name: "Green Bonds",
                    description: "Bonds issued to finance projects that have positive environmental benefits."
                },
                {
                    name: "Social Bonds",
                    description: "Bonds issued to finance projects that have positive social outcomes."
                },
                {
                    name: "Sustainable Funds",
                    description: "Investment funds that focus on companies meeting environmental, social, and governance (ESG) criteria."
                },
                {
                    name: "Impact Investments",
                    description: "Investments made into companies, organizations, and funds with the intention to generate measurable, beneficial social or environmental impact."
                }
            ]
        },
        10: {
            title: "Financial Engineering Instruments",
            description: "Advanced financial instruments created through sophisticated engineering techniques.",
            instruments: [
                {
                    name: "Synthetic Securities",
                    description: "Instruments created using a combination of financial instruments to simulate other instruments."
                },
                {
                    name: "Split-Strike Conversions",
                    description: "A trading strategy involving the simultaneous purchase of shares of stock, the sale of call options, and the purchase of put options."
                },
                {
                    name: "Spread Betting",
                    description: "A derivative strategy where participants bet on the price movement of a security or market without owning the underlying asset."
                }
            ]
        }
    },
    
    // Search index for quick lookup
    searchIndex: {
        "stocks": [1],
        "equities": [1],
        "bonds": [1],
        "derivatives": [2, 5, 7],
        "options": [2, 7],
        "futures": [2],
        "swaps": [2, 5],
        "convertible": [3],
        "preferred": [3],
        "structured": [4],
        "mbs": [4],
        "cdo": [4],
        "abs": [4],
        "credit default": [5],
        "cds": [5],
        "alternative": [6],
        "private equity": [6],
        "hedge funds": [6],
        "reits": [6],
        "commodities": [6],
        "exotic": [7],
        "weather": [7],
        "catastrophe": [7],
        "binary": [7],
        "cryptocurrency": [8],
        "bitcoin": [8],
        "ethereum": [8],
        "stablecoins": [8],
        "nft": [8],
        "sustainable": [9],
        "esg": [9],
        "green": [9],
        "impact": [9],
        "synthetic": [10],
        "engineering": [10],
        "spread betting": [10]
    }
};

// Helper function to search through codex data
export function searchCodex(query) {
    const searchTerms = query.toLowerCase().split(' ');
    const results = [];
    const foundLayers = new Set();
    
    // Search through the search index
    for (const term of searchTerms) {
        for (const [keyword, layers] of Object.entries(CODEX_DATA.searchIndex)) {
            if (keyword.includes(term) || term.includes(keyword)) {
                layers.forEach(layer => foundLayers.add(layer));
            }
        }
    }
    
    // Convert to results
    foundLayers.forEach(layerNum => {
        const layer = CODEX_DATA.layers[layerNum];
        if (layer) {
            results.push({
                layer: layerNum,
                title: `Layer ${layerNum}: ${layer.title}`,
                description: layer.description,
                instruments: layer.instruments
            });
        }
    });
    
    return results;
}

// Helper function to get layer content
export function getLayerContent(layerNumber) {
    return CODEX_DATA.layers[layerNumber] || {
        title: `Layer ${layerNumber}`,
        description: "Advanced financial instruments and control mechanisms.",
        instruments: [
            {
                name: "Advanced Instrument",
                description: "Complex financial instrument designed for sophisticated market participants."
            }
        ]
    };
} 