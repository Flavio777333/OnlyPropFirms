-- Bulk Import of Prop Firms
-- Note: Selectors are initialized as NULL or generic placeholders.
-- Scraper will need specific selectors to be updated later.

INSERT INTO source_catalog (
    prop_firm_id, prop_firm_name, official_url, pricing_page_url,
    update_strategy, update_frequency, is_active,
    json_config
) VALUES 
-- FUTURES
('myfundedfutures', 'MyFundedFutures', 'https://myfundedfutures.com', 'https://myfundedfutures.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('tradeday', 'TradeDay', 'https://tradeday.io', 'https://tradeday.io', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('earn2trade', 'Earn2Trade', 'https://earn2trade.com', 'https://earn2trade.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('takeprofittrader', 'Take Profit Trader', 'https://takeprofittrader.com', 'https://takeprofittrader.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('bulenox', 'Bulenox', 'https://bulenox.com', 'https://bulenox.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('uprofit', 'UProfit', 'https://uprofit.com', 'https://uprofit.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('tickticktrader', 'TickTickTrader', 'https://tickticktrader.com', 'https://tickticktrader.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('elitetraderfunding', 'Elite Trader Funding', 'https://elitetraderfunding.com', 'https://elitetraderfunding.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('bluskytrading', 'BluSky Trading', 'https://bluskytrading.com', 'https://bluskytrading.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('fundingticks', 'FundingTicks', 'https://fundingticks.com', 'https://fundingticks.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('daytraders', 'DayTraders', 'https://daytraders.com', 'https://daytraders.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('fundedfuturesnetwork', 'Funded Futures Network', 'https://fundedfuturesnetwork.com', 'https://fundedfuturesnetwork.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('fasttracktrading', 'Fast Track Trading', 'https://fasttracktrading.net', 'https://fasttracktrading.net', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),

-- FOREX / CFD
('the5ers', 'The 5%ers', 'https://the5ers.com', 'https://the5ers.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('fundednext', 'FundedNext', 'https://fundednext.com', 'https://fundednext.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('fundingpips', 'Funding Pips', 'https://fundingpips.com', 'https://fundingpips.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('e8markets', 'E8 Markets', 'https://e8markets.com', 'https://e8markets.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('goatfundedtrader', 'Goat Funded Trader', 'https://goatfundedtrader.com', 'https://goatfundedtrader.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('alphacapitalgroup', 'Alpha Capital Group', 'https://alphacapitalgroup.uk', 'https://alphacapitalgroup.uk', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('maventrading', 'Maven Trading', 'https://maventrading.com', 'https://maventrading.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('fxify', 'FXIFY', 'https://fxify.com', 'https://fxify.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('blueberryfunded', 'Blueberry Funded', 'https://blueberryfunded.com', 'https://blueberryfunded.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('citytradersimperium', 'City Traders Imperium', 'https://citytradersimperium.com', 'https://citytradersimperium.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('dnafunded', 'DNA Funded', 'https://dnafunded.com', 'https://dnafunded.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('funderpro', 'FunderPro', 'https://funderpro.com', 'https://funderpro.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('instantfunding', 'Instant Funding', 'https://instantfunding.io', 'https://instantfunding.io', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('larkfunding', 'Lark Funding', 'https://larkfunding.com', 'https://larkfunding.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('audacitycapital', 'Audacity Capital', 'https://audacitycapital.com', 'https://audacitycapital.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('mentfunding', 'Ment Funding', 'https://mentfunding.com', 'https://mentfunding.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('surgetrader', 'SurgeTrader', 'https://surgetrader.com', 'https://surgetrader.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}'),
('thefundedtrader', 'The Funded Trader', 'https://thefundedtraderprogram.com', 'https://thefundedtraderprogram.com', 'HTML_CRAWL', 'DAILY', true, '{"htmlSelectors": {"containerSelector": null}}')

ON CONFLICT (prop_firm_id) DO UPDATE 
SET official_url = EXCLUDED.official_url,
    is_active = true;
