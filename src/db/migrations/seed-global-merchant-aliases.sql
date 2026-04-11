-- Seed: 500 most common UK merchants for global_merchant_aliases.
-- Run AFTER add-global-merchant-aliases.sql migration.
-- Safe to re-run — uses ON CONFLICT to skip existing aliases.

-- ══════════════════════════════════════════════════════════════════════
-- GROCERIES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('tesco stores', 'Tesco', 'Groceries', 'grocery', 'seed'),
  ('tesco express', 'Tesco', 'Groceries', 'grocery', 'seed'),
  ('tesco extra', 'Tesco', 'Groceries', 'grocery', 'seed'),
  ('tesco metro', 'Tesco', 'Groceries', 'grocery', 'seed'),
  ('tesco', 'Tesco', 'Groceries', 'grocery', 'seed'),
  ('sainsburys', 'Sainsbury''s', 'Groceries', 'grocery', 'seed'),
  ('sainsbury''s', 'Sainsbury''s', 'Groceries', 'grocery', 'seed'),
  ('sainsbury local', 'Sainsbury''s', 'Groceries', 'grocery', 'seed'),
  ('j sainsbury', 'Sainsbury''s', 'Groceries', 'grocery', 'seed'),
  ('asda stores', 'Asda', 'Groceries', 'grocery', 'seed'),
  ('asda superstore', 'Asda', 'Groceries', 'grocery', 'seed'),
  ('asda', 'Asda', 'Groceries', 'grocery', 'seed'),
  ('morrisons', 'Morrisons', 'Groceries', 'grocery', 'seed'),
  ('wm morrisons', 'Morrisons', 'Groceries', 'grocery', 'seed'),
  ('morrisons daily', 'Morrisons', 'Groceries', 'grocery', 'seed'),
  ('aldi stores', 'Aldi', 'Groceries', 'grocery', 'seed'),
  ('aldi', 'Aldi', 'Groceries', 'grocery', 'seed'),
  ('lidl gb', 'Lidl', 'Groceries', 'grocery', 'seed'),
  ('lidl', 'Lidl', 'Groceries', 'grocery', 'seed'),
  ('waitrose', 'Waitrose', 'Groceries', 'grocery', 'seed'),
  ('waitrose & partners', 'Waitrose', 'Groceries', 'grocery', 'seed'),
  ('little waitrose', 'Waitrose', 'Groceries', 'grocery', 'seed'),
  ('m&s foodhall', 'M&S Food', 'Groceries', 'grocery', 'seed'),
  ('m&s food', 'M&S Food', 'Groceries', 'grocery', 'seed'),
  ('m&s simply food', 'M&S Food', 'Groceries', 'grocery', 'seed'),
  ('marks spencer food', 'M&S Food', 'Groceries', 'grocery', 'seed'),
  ('co-op group', 'Co-op', 'Groceries', 'grocery', 'seed'),
  ('co-operative food', 'Co-op', 'Groceries', 'grocery', 'seed'),
  ('co-op', 'Co-op', 'Groceries', 'grocery', 'seed'),
  ('coop food', 'Co-op', 'Groceries', 'grocery', 'seed'),
  ('ocado', 'Ocado', 'Groceries', 'grocery', 'seed'),
  ('ocado retail', 'Ocado', 'Groceries', 'grocery', 'seed'),
  ('costco wholesale', 'Costco', 'Groceries', 'grocery', 'seed'),
  ('costco', 'Costco', 'Groceries', 'grocery', 'seed'),
  ('iceland foods', 'Iceland', 'Groceries', 'grocery', 'seed'),
  ('iceland', 'Iceland', 'Groceries', 'grocery', 'seed'),
  ('farmfoods', 'Farmfoods', 'Groceries', 'grocery', 'seed'),
  ('heron foods', 'Heron Foods', 'Groceries', 'grocery', 'seed'),
  ('jack''s', 'Jack''s', 'Groceries', 'grocery', 'seed'),
  ('budgens', 'Budgens', 'Groceries', 'grocery', 'seed'),
  ('spar', 'Spar', 'Groceries', 'grocery', 'seed'),
  ('nisa', 'Nisa', 'Groceries', 'grocery', 'seed'),
  ('londis', 'Londis', 'Groceries', 'grocery', 'seed'),
  ('premier stores', 'Premier', 'Groceries', 'grocery', 'seed'),
  ('one stop', 'One Stop', 'Groceries', 'grocery', 'seed'),
  ('whole foods market', 'Whole Foods', 'Groceries', 'grocery', 'seed'),
  ('whole foods', 'Whole Foods', 'Groceries', 'grocery', 'seed'),
  ('planet organic', 'Planet Organic', 'Groceries', 'grocery', 'seed'),
  ('amazon fresh', 'Amazon Fresh', 'Groceries', 'grocery', 'seed'),
  ('getir', 'Getir', 'Groceries', 'grocery', 'seed'),
  ('gorillas', 'Gorillas', 'Groceries', 'grocery', 'seed'),
  ('gousto', 'Gousto', 'Groceries', 'grocery', 'seed'),
  ('hello fresh', 'HelloFresh', 'Groceries', 'grocery', 'seed'),
  ('hellofresh', 'HelloFresh', 'Groceries', 'grocery', 'seed'),
  ('abel & cole', 'Abel & Cole', 'Groceries', 'grocery', 'seed'),
  ('booths', 'Booths', 'Groceries', 'grocery', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- RESTAURANTS, CAFES & FOOD DELIVERY
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('mcdonald''s', 'McDonald''s', 'Dining Out', 'restaurant', 'seed'),
  ('mcdonalds', 'McDonald''s', 'Dining Out', 'restaurant', 'seed'),
  ('burger king', 'Burger King', 'Dining Out', 'restaurant', 'seed'),
  ('kfc', 'KFC', 'Dining Out', 'restaurant', 'seed'),
  ('kentucky fried', 'KFC', 'Dining Out', 'restaurant', 'seed'),
  ('subway', 'Subway', 'Dining Out', 'restaurant', 'seed'),
  ('greggs', 'Greggs', 'Dining Out', 'restaurant', 'seed'),
  ('pret a manger', 'Pret A Manger', 'Dining Out', 'restaurant', 'seed'),
  ('pret', 'Pret A Manger', 'Dining Out', 'restaurant', 'seed'),
  ('nando''s', 'Nando''s', 'Dining Out', 'restaurant', 'seed'),
  ('nandos', 'Nando''s', 'Dining Out', 'restaurant', 'seed'),
  ('pizza hut', 'Pizza Hut', 'Dining Out', 'restaurant', 'seed'),
  ('dominos pizza', 'Domino''s', 'Dining Out', 'restaurant', 'seed'),
  ('domino''s', 'Domino''s', 'Dining Out', 'restaurant', 'seed'),
  ('papa johns', 'Papa John''s', 'Dining Out', 'restaurant', 'seed'),
  ('wagamama', 'Wagamama', 'Dining Out', 'restaurant', 'seed'),
  ('five guys', 'Five Guys', 'Dining Out', 'restaurant', 'seed'),
  ('dishoom', 'Dishoom', 'Dining Out', 'restaurant', 'seed'),
  ('pizza express', 'Pizza Express', 'Dining Out', 'restaurant', 'seed'),
  ('pizzaexpress', 'Pizza Express', 'Dining Out', 'restaurant', 'seed'),
  ('leon', 'Leon', 'Dining Out', 'restaurant', 'seed'),
  ('leon restaurants', 'Leon', 'Dining Out', 'restaurant', 'seed'),
  ('itsu', 'Itsu', 'Dining Out', 'restaurant', 'seed'),
  ('franco manca', 'Franco Manca', 'Dining Out', 'restaurant', 'seed'),
  ('honest burgers', 'Honest Burgers', 'Dining Out', 'restaurant', 'seed'),
  ('tortilla', 'Tortilla', 'Dining Out', 'restaurant', 'seed'),
  ('wasabi', 'Wasabi', 'Dining Out', 'restaurant', 'seed'),
  ('yo sushi', 'Yo! Sushi', 'Dining Out', 'restaurant', 'seed'),
  ('yo!', 'Yo! Sushi', 'Dining Out', 'restaurant', 'seed'),
  ('gourmet burger kitchen', 'GBK', 'Dining Out', 'restaurant', 'seed'),
  ('gbk', 'GBK', 'Dining Out', 'restaurant', 'seed'),
  ('wimpy', 'Wimpy', 'Dining Out', 'restaurant', 'seed'),
  ('tgi fridays', 'TGI Fridays', 'Dining Out', 'restaurant', 'seed'),
  ('frankie & bennys', 'Frankie & Benny''s', 'Dining Out', 'restaurant', 'seed'),
  ('chiquito', 'Chiquito', 'Dining Out', 'restaurant', 'seed'),
  ('harvester', 'Harvester', 'Dining Out', 'restaurant', 'seed'),
  ('toby carvery', 'Toby Carvery', 'Dining Out', 'restaurant', 'seed'),
  ('beefeater', 'Beefeater', 'Dining Out', 'restaurant', 'seed'),
  ('brewers fayre', 'Brewers Fayre', 'Dining Out', 'restaurant', 'seed'),
  ('ask italian', 'ASK Italian', 'Dining Out', 'restaurant', 'seed'),
  ('zizzi', 'Zizzi', 'Dining Out', 'restaurant', 'seed'),
  ('carluccio''s', 'Carluccio''s', 'Dining Out', 'restaurant', 'seed'),
  ('prezzo', 'Prezzo', 'Dining Out', 'restaurant', 'seed'),
  ('the ivy', 'The Ivy', 'Dining Out', 'restaurant', 'seed'),
  ('bills restaurant', 'Bill''s', 'Dining Out', 'restaurant', 'seed'),
  ('bill''s', 'Bill''s', 'Dining Out', 'restaurant', 'seed'),
  ('wahaca', 'Wahaca', 'Dining Out', 'restaurant', 'seed'),
  ('byron burger', 'Byron', 'Dining Out', 'restaurant', 'seed'),
  ('shake shack', 'Shake Shack', 'Dining Out', 'restaurant', 'seed'),
  ('wetherspoons', 'Wetherspoons', 'Dining Out', 'restaurant', 'seed'),
  ('j d wetherspoon', 'Wetherspoons', 'Dining Out', 'restaurant', 'seed'),
  ('miller & carter', 'Miller & Carter', 'Dining Out', 'restaurant', 'seed'),
  ('slug and lettuce', 'Slug & Lettuce', 'Dining Out', 'restaurant', 'seed'),
  ('las iguanas', 'Las Iguanas', 'Dining Out', 'restaurant', 'seed'),
  ('the real greek', 'The Real Greek', 'Dining Out', 'restaurant', 'seed'),
  ('flat iron', 'Flat Iron', 'Dining Out', 'restaurant', 'seed'),
  ('chipotle', 'Chipotle', 'Dining Out', 'restaurant', 'seed'),
  ('chick-fil-a', 'Chick-fil-A', 'Dining Out', 'restaurant', 'seed'),
  ('popeyes', 'Popeyes', 'Dining Out', 'restaurant', 'seed'),
  ('wingstop', 'Wingstop', 'Dining Out', 'restaurant', 'seed'),
  ('wendy''s', 'Wendy''s', 'Dining Out', 'restaurant', 'seed'),
  ('taco bell', 'Taco Bell', 'Dining Out', 'restaurant', 'seed'),
  -- Coffee
  ('starbucks', 'Starbucks', 'Dining Out', 'restaurant', 'seed'),
  ('costa coffee', 'Costa Coffee', 'Dining Out', 'restaurant', 'seed'),
  ('costa', 'Costa Coffee', 'Dining Out', 'restaurant', 'seed'),
  ('caffe nero', 'Caffè Nero', 'Dining Out', 'restaurant', 'seed'),
  ('nero', 'Caffè Nero', 'Dining Out', 'restaurant', 'seed'),
  ('black sheep coffee', 'Black Sheep Coffee', 'Dining Out', 'restaurant', 'seed'),
  ('joe & the juice', 'Joe & The Juice', 'Dining Out', 'restaurant', 'seed'),
  ('eat.', 'EAT.', 'Dining Out', 'restaurant', 'seed'),
  ('paul bakery', 'PAUL', 'Dining Out', 'restaurant', 'seed'),
  ('gail''s', 'Gail''s', 'Dining Out', 'restaurant', 'seed'),
  ('gails bakery', 'Gail''s', 'Dining Out', 'restaurant', 'seed'),
  ('tim hortons', 'Tim Hortons', 'Dining Out', 'restaurant', 'seed'),
  -- Delivery
  ('deliveroo', 'Deliveroo', 'Dining Out', 'restaurant', 'seed'),
  ('uber eats', 'Uber Eats', 'Dining Out', 'restaurant', 'seed'),
  ('ubereats', 'Uber Eats', 'Dining Out', 'restaurant', 'seed'),
  ('just eat', 'Just Eat', 'Dining Out', 'restaurant', 'seed'),
  ('justeat', 'Just Eat', 'Dining Out', 'restaurant', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- RETAILERS & SHOPPING
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- General / Online
  ('amazon.co.uk', 'Amazon', 'Shopping', 'retailer', 'seed'),
  ('amzn mktp', 'Amazon', 'Shopping', 'retailer', 'seed'),
  ('amazon marketplace', 'Amazon', 'Shopping', 'retailer', 'seed'),
  ('amazon', 'Amazon', 'Shopping', 'retailer', 'seed'),
  ('ebay', 'eBay', 'Shopping', 'retailer', 'seed'),
  ('paypal *ebay', 'eBay', 'Shopping', 'retailer', 'seed'),
  ('asos', 'ASOS', 'Shopping', 'retailer', 'seed'),
  ('asos.com', 'ASOS', 'Shopping', 'retailer', 'seed'),
  ('etsy', 'Etsy', 'Shopping', 'retailer', 'seed'),
  ('etsy.com', 'Etsy', 'Shopping', 'retailer', 'seed'),
  ('aliexpress', 'AliExpress', 'Shopping', 'retailer', 'seed'),
  ('shein', 'Shein', 'Shopping', 'retailer', 'seed'),
  ('temu', 'Temu', 'Shopping', 'retailer', 'seed'),
  ('wish.com', 'Wish', 'Shopping', 'retailer', 'seed'),
  ('vinted', 'Vinted', 'Shopping', 'retailer', 'seed'),
  ('depop', 'Depop', 'Shopping', 'retailer', 'seed'),
  -- Department Stores
  ('john lewis', 'John Lewis', 'Shopping', 'retailer', 'seed'),
  ('john lewis & partners', 'John Lewis', 'Shopping', 'retailer', 'seed'),
  ('marks & spencer', 'Marks & Spencer', 'Shopping', 'retailer', 'seed'),
  ('marks spencer', 'Marks & Spencer', 'Shopping', 'retailer', 'seed'),
  ('m&s', 'Marks & Spencer', 'Shopping', 'retailer', 'seed'),
  ('selfridges', 'Selfridges', 'Shopping', 'retailer', 'seed'),
  ('harrods', 'Harrods', 'Shopping', 'retailer', 'seed'),
  ('debenhams', 'Debenhams', 'Shopping', 'retailer', 'seed'),
  ('house of fraser', 'House of Fraser', 'Shopping', 'retailer', 'seed'),
  ('harvey nichols', 'Harvey Nichols', 'Shopping', 'retailer', 'seed'),
  ('liberty london', 'Liberty', 'Shopping', 'retailer', 'seed'),
  -- Fashion
  ('zara', 'Zara', 'Shopping', 'retailer', 'seed'),
  ('h&m', 'H&M', 'Shopping', 'retailer', 'seed'),
  ('primark', 'Primark', 'Shopping', 'retailer', 'seed'),
  ('uniqlo', 'Uniqlo', 'Shopping', 'retailer', 'seed'),
  ('next retail', 'Next', 'Shopping', 'retailer', 'seed'),
  ('next', 'Next', 'Shopping', 'retailer', 'seed'),
  ('new look', 'New Look', 'Shopping', 'retailer', 'seed'),
  ('river island', 'River Island', 'Shopping', 'retailer', 'seed'),
  ('topshop', 'Topshop', 'Shopping', 'retailer', 'seed'),
  ('superdry', 'Superdry', 'Shopping', 'retailer', 'seed'),
  ('gap', 'Gap', 'Shopping', 'retailer', 'seed'),
  ('mango', 'Mango', 'Shopping', 'retailer', 'seed'),
  ('cos stores', 'COS', 'Shopping', 'retailer', 'seed'),
  ('& other stories', '& Other Stories', 'Shopping', 'retailer', 'seed'),
  ('arket', 'Arket', 'Shopping', 'retailer', 'seed'),
  ('massimo dutti', 'Massimo Dutti', 'Shopping', 'retailer', 'seed'),
  ('pull & bear', 'Pull & Bear', 'Shopping', 'retailer', 'seed'),
  ('bershka', 'Bershka', 'Shopping', 'retailer', 'seed'),
  ('joules', 'Joules', 'Shopping', 'retailer', 'seed'),
  ('fat face', 'Fat Face', 'Shopping', 'retailer', 'seed'),
  ('white stuff', 'White Stuff', 'Shopping', 'retailer', 'seed'),
  ('monsoon', 'Monsoon', 'Shopping', 'retailer', 'seed'),
  ('jd sports', 'JD Sports', 'Shopping', 'retailer', 'seed'),
  ('sports direct', 'Sports Direct', 'Shopping', 'retailer', 'seed'),
  ('nike', 'Nike', 'Shopping', 'retailer', 'seed'),
  ('nike.com', 'Nike', 'Shopping', 'retailer', 'seed'),
  ('adidas', 'Adidas', 'Shopping', 'retailer', 'seed'),
  ('foot locker', 'Foot Locker', 'Shopping', 'retailer', 'seed'),
  -- Home & Electronics
  ('currys', 'Currys', 'Shopping', 'retailer', 'seed'),
  ('currys pc world', 'Currys', 'Shopping', 'retailer', 'seed'),
  ('argos', 'Argos', 'Shopping', 'retailer', 'seed'),
  ('ikea', 'IKEA', 'Shopping', 'retailer', 'seed'),
  ('dunelm', 'Dunelm', 'Shopping', 'retailer', 'seed'),
  ('the range', 'The Range', 'Shopping', 'retailer', 'seed'),
  ('b&q', 'B&Q', 'Shopping', 'retailer', 'seed'),
  ('homebase', 'Homebase', 'Shopping', 'retailer', 'seed'),
  ('wickes', 'Wickes', 'Shopping', 'retailer', 'seed'),
  ('screwfix', 'Screwfix', 'Shopping', 'retailer', 'seed'),
  ('toolstation', 'Toolstation', 'Shopping', 'retailer', 'seed'),
  ('robert dyas', 'Robert Dyas', 'Shopping', 'retailer', 'seed'),
  ('wilko', 'Wilko', 'Shopping', 'retailer', 'seed'),
  ('habitat', 'Habitat', 'Shopping', 'retailer', 'seed'),
  ('made.com', 'Made.com', 'Shopping', 'retailer', 'seed'),
  ('apple store', 'Apple Store', 'Shopping', 'retailer', 'seed'),
  ('apple.com/bill', 'Apple Store', 'Shopping', 'retailer', 'seed'),
  ('samsung', 'Samsung', 'Shopping', 'retailer', 'seed'),
  ('carphone warehouse', 'Carphone Warehouse', 'Shopping', 'retailer', 'seed'),
  -- Discount / Variety
  ('tk maxx', 'TK Maxx', 'Shopping', 'retailer', 'seed'),
  ('tkmaxx', 'TK Maxx', 'Shopping', 'retailer', 'seed'),
  ('poundland', 'Poundland', 'Shopping', 'retailer', 'seed'),
  ('home bargains', 'Home Bargains', 'Shopping', 'retailer', 'seed'),
  ('b&m', 'B&M', 'Shopping', 'retailer', 'seed'),
  ('b&m bargains', 'B&M', 'Shopping', 'retailer', 'seed'),
  ('flying tiger', 'Flying Tiger', 'Shopping', 'retailer', 'seed'),
  -- Books & Stationery
  ('waterstones', 'Waterstones', 'Shopping', 'retailer', 'seed'),
  ('wh smith', 'WHSmith', 'Shopping', 'retailer', 'seed'),
  ('whsmith', 'WHSmith', 'Shopping', 'retailer', 'seed'),
  ('ryman', 'Ryman', 'Shopping', 'retailer', 'seed'),
  -- Beauty
  ('boots', 'Boots', 'Shopping', 'retailer', 'seed'),
  ('superdrug', 'Superdrug', 'Shopping', 'retailer', 'seed'),
  ('the body shop', 'The Body Shop', 'Shopping', 'retailer', 'seed'),
  ('lush', 'Lush', 'Shopping', 'retailer', 'seed'),
  ('space nk', 'Space NK', 'Shopping', 'retailer', 'seed'),
  ('sephora', 'Sephora', 'Shopping', 'retailer', 'seed'),
  ('charlotte tilbury', 'Charlotte Tilbury', 'Shopping', 'retailer', 'seed'),
  -- Pets
  ('pets at home', 'Pets at Home', 'Shopping', 'retailer', 'seed'),
  ('pet supermarket', 'Pet Supermarket', 'Shopping', 'retailer', 'seed'),
  -- Toys & Kids
  ('smyths toys', 'Smyths Toys', 'Shopping', 'retailer', 'seed'),
  ('the entertainer', 'The Entertainer', 'Shopping', 'retailer', 'seed'),
  -- Garden
  ('garden centre', 'Garden Centre', 'Shopping', 'retailer', 'seed'),
  ('dobbies', 'Dobbies', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS (streaming, music, software, gyms)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- Streaming
  ('netflix.com', 'Netflix', 'Entertainment', 'subscription', 'Netflix', 'seed'),
  ('netflix inc', 'Netflix', 'Entertainment', 'subscription', 'Netflix', 'seed'),
  ('netflix.com/bill', 'Netflix', 'Entertainment', 'subscription', 'Netflix', 'seed'),
  ('netflix', 'Netflix', 'Entertainment', 'subscription', 'Netflix', 'seed'),
  ('disney plus', 'Disney+', 'Entertainment', 'subscription', 'Disney+', 'seed'),
  ('disneyplus', 'Disney+', 'Entertainment', 'subscription', 'Disney+', 'seed'),
  ('disney+', 'Disney+', 'Entertainment', 'subscription', 'Disney+', 'seed'),
  ('amazon prime', 'Amazon Prime', 'Entertainment', 'subscription', 'Amazon Prime', 'seed'),
  ('prime video', 'Amazon Prime', 'Entertainment', 'subscription', 'Amazon Prime', 'seed'),
  ('amzn prime', 'Amazon Prime', 'Entertainment', 'subscription', 'Amazon Prime', 'seed'),
  ('now tv', 'NOW TV', 'Entertainment', 'subscription', 'NOW TV', 'seed'),
  ('nowtv', 'NOW TV', 'Entertainment', 'subscription', 'NOW TV', 'seed'),
  ('apple tv', 'Apple TV+', 'Entertainment', 'subscription', 'Apple TV+', 'seed'),
  ('apple tv+', 'Apple TV+', 'Entertainment', 'subscription', 'Apple TV+', 'seed'),
  ('paramount+', 'Paramount+', 'Entertainment', 'subscription', 'Paramount+', 'seed'),
  ('paramount plus', 'Paramount+', 'Entertainment', 'subscription', 'Paramount+', 'seed'),
  ('discovery+', 'Discovery+', 'Entertainment', 'subscription', 'Discovery+', 'seed'),
  ('britbox', 'BritBox', 'Entertainment', 'subscription', 'BritBox', 'seed'),
  ('mubi', 'MUBI', 'Entertainment', 'subscription', 'MUBI', 'seed'),
  ('crunchyroll', 'Crunchyroll', 'Entertainment', 'subscription', 'Crunchyroll', 'seed'),
  ('hayu', 'Hayu', 'Entertainment', 'subscription', 'Hayu', 'seed'),
  ('dazn', 'DAZN', 'Entertainment', 'subscription', 'DAZN', 'seed'),
  ('youtube premium', 'YouTube Premium', 'Entertainment', 'subscription', 'YouTube Premium', 'seed'),
  ('youtube music', 'YouTube Music', 'Entertainment', 'subscription', 'YouTube Music', 'seed'),
  -- Music
  ('spotify', 'Spotify', 'Entertainment', 'subscription', 'Spotify', 'seed'),
  ('spotify premium', 'Spotify', 'Entertainment', 'subscription', 'Spotify', 'seed'),
  ('apple music', 'Apple Music', 'Entertainment', 'subscription', 'Apple Music', 'seed'),
  ('apple.com/bill music', 'Apple Music', 'Entertainment', 'subscription', 'Apple Music', 'seed'),
  ('tidal', 'Tidal', 'Entertainment', 'subscription', 'Tidal', 'seed'),
  ('deezer', 'Deezer', 'Entertainment', 'subscription', 'Deezer', 'seed'),
  ('amazon music', 'Amazon Music', 'Entertainment', 'subscription', 'Amazon Music', 'seed'),
  ('audible', 'Audible', 'Entertainment', 'subscription', 'Audible', 'seed'),
  ('audible.co.uk', 'Audible', 'Entertainment', 'subscription', 'Audible', 'seed'),
  -- Gaming
  ('xbox game pass', 'Xbox Game Pass', 'Entertainment', 'subscription', 'Xbox Game Pass', 'seed'),
  ('xbox live', 'Xbox Live', 'Entertainment', 'subscription', 'Xbox Live', 'seed'),
  ('microsoft xbox', 'Xbox', 'Entertainment', 'subscription', 'Xbox', 'seed'),
  ('playstation plus', 'PlayStation Plus', 'Entertainment', 'subscription', 'PlayStation Plus', 'seed'),
  ('playstation network', 'PlayStation', 'Entertainment', 'subscription', 'PlayStation', 'seed'),
  ('nintendo eshop', 'Nintendo', 'Entertainment', 'subscription', 'Nintendo Online', 'seed'),
  ('steam', 'Steam', 'Entertainment', 'retailer', NULL, 'seed'),
  ('steamgames.com', 'Steam', 'Entertainment', 'retailer', NULL, 'seed'),
  -- Software
  ('microsoft 365', 'Microsoft 365', 'Bills & Utilities', 'subscription', 'Microsoft 365', 'seed'),
  ('microsoft office', 'Microsoft 365', 'Bills & Utilities', 'subscription', 'Microsoft 365', 'seed'),
  ('ms office', 'Microsoft 365', 'Bills & Utilities', 'subscription', 'Microsoft 365', 'seed'),
  ('google one', 'Google One', 'Bills & Utilities', 'subscription', 'Google One', 'seed'),
  ('google storage', 'Google One', 'Bills & Utilities', 'subscription', 'Google One', 'seed'),
  ('icloud', 'iCloud+', 'Bills & Utilities', 'subscription', 'iCloud+', 'seed'),
  ('apple icloud', 'iCloud+', 'Bills & Utilities', 'subscription', 'iCloud+', 'seed'),
  ('dropbox', 'Dropbox', 'Bills & Utilities', 'subscription', 'Dropbox', 'seed'),
  ('adobe', 'Adobe', 'Bills & Utilities', 'subscription', 'Adobe Creative Cloud', 'seed'),
  ('adobe creative', 'Adobe', 'Bills & Utilities', 'subscription', 'Adobe Creative Cloud', 'seed'),
  ('canva', 'Canva', 'Bills & Utilities', 'subscription', 'Canva Pro', 'seed'),
  ('notion', 'Notion', 'Bills & Utilities', 'subscription', 'Notion', 'seed'),
  ('chatgpt', 'ChatGPT', 'Bills & Utilities', 'subscription', 'ChatGPT Plus', 'seed'),
  ('openai', 'OpenAI', 'Bills & Utilities', 'subscription', 'ChatGPT Plus', 'seed'),
  -- News
  ('the times', 'The Times', 'Entertainment', 'subscription', 'The Times', 'seed'),
  ('times digital', 'The Times', 'Entertainment', 'subscription', 'The Times', 'seed'),
  ('the telegraph', 'The Telegraph', 'Entertainment', 'subscription', 'The Telegraph', 'seed'),
  ('ft.com', 'Financial Times', 'Entertainment', 'subscription', 'Financial Times', 'seed'),
  ('financial times', 'Financial Times', 'Entertainment', 'subscription', 'Financial Times', 'seed'),
  ('the athletic', 'The Athletic', 'Entertainment', 'subscription', 'The Athletic', 'seed'),
  ('the guardian', 'The Guardian', 'Entertainment', 'subscription', 'The Guardian', 'seed'),
  ('economist', 'The Economist', 'Entertainment', 'subscription', 'The Economist', 'seed'),
  -- Gyms & Fitness
  ('puregym', 'PureGym', 'Health', 'subscription', 'PureGym', 'seed'),
  ('pure gym', 'PureGym', 'Health', 'subscription', 'PureGym', 'seed'),
  ('the gym group', 'The Gym Group', 'Health', 'subscription', 'The Gym Group', 'seed'),
  ('the gym ltd', 'The Gym Group', 'Health', 'subscription', 'The Gym Group', 'seed'),
  ('david lloyd', 'David Lloyd', 'Health', 'subscription', 'David Lloyd', 'seed'),
  ('virgin active', 'Virgin Active', 'Health', 'subscription', 'Virgin Active', 'seed'),
  ('nuffield health', 'Nuffield Health', 'Health', 'subscription', 'Nuffield Health', 'seed'),
  ('anytime fitness', 'Anytime Fitness', 'Health', 'subscription', 'Anytime Fitness', 'seed'),
  ('barry''s', 'Barry''s', 'Health', 'subscription', 'Barry''s', 'seed'),
  ('f45 training', 'F45 Training', 'Health', 'subscription', 'F45 Training', 'seed'),
  ('classpass', 'ClassPass', 'Health', 'subscription', 'ClassPass', 'seed'),
  ('peloton', 'Peloton', 'Health', 'subscription', 'Peloton', 'seed'),
  ('strava', 'Strava', 'Health', 'subscription', 'Strava', 'seed'),
  ('myfitnesspal', 'MyFitnessPal', 'Health', 'subscription', 'MyFitnessPal', 'seed'),
  -- Dating
  ('tinder', 'Tinder', 'Entertainment', 'subscription', 'Tinder', 'seed'),
  ('bumble', 'Bumble', 'Entertainment', 'subscription', 'Bumble', 'seed'),
  ('hinge', 'Hinge', 'Entertainment', 'subscription', 'Hinge', 'seed'),
  -- VPN / Security
  ('nordvpn', 'NordVPN', 'Bills & Utilities', 'subscription', 'NordVPN', 'seed'),
  ('expressvpn', 'ExpressVPN', 'Bills & Utilities', 'subscription', 'ExpressVPN', 'seed'),
  ('1password', '1Password', 'Bills & Utilities', 'subscription', '1Password', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- SKY & BROADBAND / TV BUNDLES (subscription)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('sky uk', 'Sky', 'Bills & Utilities', 'subscription', 'Sky', 'seed'),
  ('sky broadband', 'Sky', 'Bills & Utilities', 'subscription', 'Sky', 'seed'),
  ('sky digital', 'Sky', 'Bills & Utilities', 'subscription', 'Sky', 'seed'),
  ('sky sports', 'Sky Sports', 'Entertainment', 'subscription', 'Sky Sports', 'seed'),
  ('bt group', 'BT', 'Bills & Utilities', 'subscription', 'BT Broadband', 'seed'),
  ('bt broadband', 'BT', 'Bills & Utilities', 'subscription', 'BT Broadband', 'seed'),
  ('bt sport', 'BT Sport', 'Entertainment', 'subscription', 'BT Sport', 'seed'),
  ('virgin media', 'Virgin Media', 'Bills & Utilities', 'subscription', 'Virgin Media', 'seed'),
  ('virgin media o2', 'Virgin Media O2', 'Bills & Utilities', 'subscription', 'Virgin Media O2', 'seed'),
  ('talktalk', 'TalkTalk', 'Bills & Utilities', 'subscription', 'TalkTalk', 'seed'),
  ('plusnet', 'Plusnet', 'Bills & Utilities', 'subscription', 'Plusnet', 'seed'),
  ('zen internet', 'Zen Internet', 'Bills & Utilities', 'subscription', 'Zen Internet', 'seed'),
  ('hyperoptic', 'Hyperoptic', 'Bills & Utilities', 'subscription', 'Hyperoptic', 'seed'),
  ('community fibre', 'Community Fibre', 'Bills & Utilities', 'subscription', 'Community Fibre', 'seed'),
  ('gigaclear', 'Gigaclear', 'Bills & Utilities', 'subscription', 'Gigaclear', 'seed'),
  ('shell energy broadband', 'Shell Energy', 'Bills & Utilities', 'subscription', 'Shell Energy Broadband', 'seed'),
  ('tv licence', 'TV Licence', 'Bills & Utilities', 'subscription', 'TV Licence', 'seed'),
  ('tv licensing', 'TV Licence', 'Bills & Utilities', 'subscription', 'TV Licence', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- UTILITIES (energy, water, council tax)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Energy
  ('british gas', 'British Gas', 'Bills & Utilities', 'utility', 'seed'),
  ('edf energy', 'EDF Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('edf', 'EDF Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('eon energy', 'E.ON', 'Bills & Utilities', 'utility', 'seed'),
  ('eon next', 'E.ON', 'Bills & Utilities', 'utility', 'seed'),
  ('e.on', 'E.ON', 'Bills & Utilities', 'utility', 'seed'),
  ('scottish power', 'Scottish Power', 'Bills & Utilities', 'utility', 'seed'),
  ('scottishpower', 'Scottish Power', 'Bills & Utilities', 'utility', 'seed'),
  ('sse energy', 'SSE', 'Bills & Utilities', 'utility', 'seed'),
  ('sse', 'SSE', 'Bills & Utilities', 'utility', 'seed'),
  ('octopus energy', 'Octopus Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('bulb energy', 'Bulb', 'Bills & Utilities', 'utility', 'seed'),
  ('bulb', 'Bulb', 'Bills & Utilities', 'utility', 'seed'),
  ('shell energy', 'Shell Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('ovo energy', 'OVO Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('ovo', 'OVO Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('utilita', 'Utilita', 'Bills & Utilities', 'utility', 'seed'),
  ('utility warehouse', 'Utility Warehouse', 'Bills & Utilities', 'utility', 'seed'),
  ('so energy', 'So Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('good energy', 'Good Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('ecotricity', 'Ecotricity', 'Bills & Utilities', 'utility', 'seed'),
  ('outfox the market', 'Outfox the Market', 'Bills & Utilities', 'utility', 'seed'),
  -- Water
  ('thames water', 'Thames Water', 'Bills & Utilities', 'utility', 'seed'),
  ('severn trent', 'Severn Trent', 'Bills & Utilities', 'utility', 'seed'),
  ('united utilities', 'United Utilities', 'Bills & Utilities', 'utility', 'seed'),
  ('anglian water', 'Anglian Water', 'Bills & Utilities', 'utility', 'seed'),
  ('yorkshire water', 'Yorkshire Water', 'Bills & Utilities', 'utility', 'seed'),
  ('southern water', 'Southern Water', 'Bills & Utilities', 'utility', 'seed'),
  ('south west water', 'South West Water', 'Bills & Utilities', 'utility', 'seed'),
  ('welsh water', 'Welsh Water', 'Bills & Utilities', 'utility', 'seed'),
  ('northumbrian water', 'Northumbrian Water', 'Bills & Utilities', 'utility', 'seed'),
  ('wessex water', 'Wessex Water', 'Bills & Utilities', 'utility', 'seed'),
  ('affinity water', 'Affinity Water', 'Bills & Utilities', 'utility', 'seed'),
  -- Council Tax
  ('council tax', 'Council Tax', 'Bills & Utilities', 'utility', 'seed'),
  ('hmrc', 'HMRC', 'Bills & Utilities', 'utility', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- MOBILE PROVIDERS (subscription)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('three mobile', 'Three', 'Bills & Utilities', 'subscription', 'Three Mobile', 'seed'),
  ('three uk', 'Three', 'Bills & Utilities', 'subscription', 'Three Mobile', 'seed'),
  ('hutchison 3g', 'Three', 'Bills & Utilities', 'subscription', 'Three Mobile', 'seed'),
  ('ee limited', 'EE', 'Bills & Utilities', 'subscription', 'EE', 'seed'),
  ('ee mobile', 'EE', 'Bills & Utilities', 'subscription', 'EE', 'seed'),
  ('vodafone', 'Vodafone', 'Bills & Utilities', 'subscription', 'Vodafone', 'seed'),
  ('vodafone uk', 'Vodafone', 'Bills & Utilities', 'subscription', 'Vodafone', 'seed'),
  ('o2 uk', 'O2', 'Bills & Utilities', 'subscription', 'O2', 'seed'),
  ('o2 telefonica', 'O2', 'Bills & Utilities', 'subscription', 'O2', 'seed'),
  ('giffgaff', 'giffgaff', 'Bills & Utilities', 'subscription', 'giffgaff', 'seed'),
  ('tesco mobile', 'Tesco Mobile', 'Bills & Utilities', 'subscription', 'Tesco Mobile', 'seed'),
  ('voxi', 'VOXI', 'Bills & Utilities', 'subscription', 'VOXI', 'seed'),
  ('smarty', 'SMARTY', 'Bills & Utilities', 'subscription', 'SMARTY', 'seed'),
  ('id mobile', 'iD Mobile', 'Bills & Utilities', 'subscription', 'iD Mobile', 'seed'),
  ('lebara', 'Lebara', 'Bills & Utilities', 'subscription', 'Lebara', 'seed'),
  ('lycamobile', 'Lycamobile', 'Bills & Utilities', 'subscription', 'Lycamobile', 'seed'),
  ('sky mobile', 'Sky Mobile', 'Bills & Utilities', 'subscription', 'Sky Mobile', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- TRANSPORT
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('tfl', 'TfL', 'Transport', 'transport', 'seed'),
  ('tfl.gov.uk', 'TfL', 'Transport', 'transport', 'seed'),
  ('transport for london', 'TfL', 'Transport', 'transport', 'seed'),
  ('tfl travel', 'TfL', 'Transport', 'transport', 'seed'),
  ('oyster auto', 'TfL', 'Transport', 'transport', 'seed'),
  ('uber', 'Uber', 'Transport', 'transport', 'seed'),
  ('uber trip', 'Uber', 'Transport', 'transport', 'seed'),
  ('uber *trip', 'Uber', 'Transport', 'transport', 'seed'),
  ('uber bv', 'Uber', 'Transport', 'transport', 'seed'),
  ('bolt ride', 'Bolt', 'Transport', 'transport', 'seed'),
  ('bolt.eu', 'Bolt', 'Transport', 'transport', 'seed'),
  ('bolt', 'Bolt', 'Transport', 'transport', 'seed'),
  ('freenow', 'FREE NOW', 'Transport', 'transport', 'seed'),
  ('free now', 'FREE NOW', 'Transport', 'transport', 'seed'),
  ('addison lee', 'Addison Lee', 'Transport', 'transport', 'seed'),
  -- Rail
  ('trainline', 'Trainline', 'Transport', 'transport', 'seed'),
  ('thetrainline', 'Trainline', 'Transport', 'transport', 'seed'),
  ('national rail', 'National Rail', 'Transport', 'transport', 'seed'),
  ('avanti west coast', 'Avanti West Coast', 'Transport', 'transport', 'seed'),
  ('lner', 'LNER', 'Transport', 'transport', 'seed'),
  ('gwr', 'GWR', 'Transport', 'transport', 'seed'),
  ('great western railway', 'GWR', 'Transport', 'transport', 'seed'),
  ('southeastern rail', 'Southeastern', 'Transport', 'transport', 'seed'),
  ('southern rail', 'Southern', 'Transport', 'transport', 'seed'),
  ('northern rail', 'Northern', 'Transport', 'transport', 'seed'),
  ('scotrail', 'ScotRail', 'Transport', 'transport', 'seed'),
  ('crosscountry', 'CrossCountry', 'Transport', 'transport', 'seed'),
  ('east midlands railway', 'East Midlands Railway', 'Transport', 'transport', 'seed'),
  ('thameslink', 'Thameslink', 'Transport', 'transport', 'seed'),
  ('elizabeth line', 'Elizabeth Line', 'Transport', 'transport', 'seed'),
  ('eurostar', 'Eurostar', 'Transport', 'transport', 'seed'),
  -- Bus & Coach
  ('national express', 'National Express', 'Transport', 'transport', 'seed'),
  ('megabus', 'Megabus', 'Transport', 'transport', 'seed'),
  ('flixbus', 'FlixBus', 'Transport', 'transport', 'seed'),
  -- Airlines
  ('british airways', 'British Airways', 'Transport', 'transport', 'seed'),
  ('easyjet', 'easyJet', 'Transport', 'transport', 'seed'),
  ('ryanair', 'Ryanair', 'Transport', 'transport', 'seed'),
  ('jet2', 'Jet2', 'Transport', 'transport', 'seed'),
  ('wizz air', 'Wizz Air', 'Transport', 'transport', 'seed'),
  ('vueling', 'Vueling', 'Transport', 'transport', 'seed'),
  ('tui airways', 'TUI', 'Transport', 'transport', 'seed'),
  ('virgin atlantic', 'Virgin Atlantic', 'Transport', 'transport', 'seed'),
  ('emirates', 'Emirates', 'Transport', 'transport', 'seed'),
  ('qatar airways', 'Qatar Airways', 'Transport', 'transport', 'seed'),
  ('turkish airlines', 'Turkish Airlines', 'Transport', 'transport', 'seed'),
  ('klm', 'KLM', 'Transport', 'transport', 'seed'),
  ('lufthansa', 'Lufthansa', 'Transport', 'transport', 'seed'),
  ('air france', 'Air France', 'Transport', 'transport', 'seed'),
  -- Fuel
  ('bp', 'BP', 'Transport', 'transport', 'seed'),
  ('shell', 'Shell', 'Transport', 'transport', 'seed'),
  ('shell fuel', 'Shell', 'Transport', 'transport', 'seed'),
  ('esso', 'Esso', 'Transport', 'transport', 'seed'),
  ('texaco', 'Texaco', 'Transport', 'transport', 'seed'),
  ('gulf', 'Gulf', 'Transport', 'transport', 'seed'),
  ('jet fuel', 'Jet', 'Transport', 'transport', 'seed'),
  ('murco', 'Murco', 'Transport', 'transport', 'seed'),
  -- Parking & EV Charging
  ('ncp', 'NCP', 'Transport', 'transport', 'seed'),
  ('ringo parking', 'RingGo', 'Transport', 'transport', 'seed'),
  ('ringgo', 'RingGo', 'Transport', 'transport', 'seed'),
  ('justpark', 'JustPark', 'Transport', 'transport', 'seed'),
  ('parkmobile', 'Parkmobile', 'Transport', 'transport', 'seed'),
  ('dart charge', 'Dart Charge', 'Transport', 'transport', 'seed'),
  ('congestion charge', 'Congestion Charge', 'Transport', 'transport', 'seed'),
  ('ulez', 'ULEZ', 'Transport', 'transport', 'seed'),
  ('bp pulse', 'BP Pulse', 'Transport', 'transport', 'seed'),
  ('pod point', 'Pod Point', 'Transport', 'transport', 'seed'),
  -- Bike / Scooter
  ('lime', 'Lime', 'Transport', 'transport', 'seed'),
  ('santander cycles', 'Santander Cycles', 'Transport', 'transport', 'seed'),
  ('tier', 'TIER', 'Transport', 'transport', 'seed'),
  ('voi', 'Voi', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- LENDERS & FINANCIAL SERVICES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, lender_for, source) VALUES
  -- Mortgages
  ('nationwide building society', 'Nationwide', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('nationwide bs', 'Nationwide', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('halifax mortgage', 'Halifax', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('halifax', 'Halifax', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('santander mortgage', 'Santander', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('santander uk', 'Santander', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('barclays mortgage', 'Barclays', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('natwest mortgage', 'NatWest', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('hsbc mortgage', 'HSBC', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('lloyds bank mortgage', 'Lloyds', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('coventry building society', 'Coventry BS', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('leeds building society', 'Leeds BS', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('skipton building society', 'Skipton BS', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('yorkshire building society', 'Yorkshire BS', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  -- Student Loans
  ('slc', 'Student Loans Company', 'Bills & Utilities', 'lender', 'Student Loan', 'seed'),
  ('student loans co', 'Student Loans Company', 'Bills & Utilities', 'lender', 'Student Loan', 'seed'),
  ('student loan repayment', 'Student Loans Company', 'Bills & Utilities', 'lender', 'Student Loan', 'seed'),
  -- Car Finance / HP
  ('black horse', 'Black Horse', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('black horse finance', 'Black Horse', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('moneybarn', 'Moneybarn', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('motonovo', 'MotoNovo', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('motonovo finance', 'MotoNovo', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('close brothers motor', 'Close Brothers', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('alphera financial', 'Alphera', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('oodle finance', 'Oodle', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  ('pcp finance', 'PCP Finance', 'Bills & Utilities', 'lender', 'Car Finance', 'seed'),
  -- Personal Loans / BNPL
  ('klarna', 'Klarna', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('clearpay', 'Clearpay', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('laybuy', 'Laybuy', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('paypal credit', 'PayPal Credit', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('zopa', 'Zopa', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('lending works', 'Lending Works', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('ratesetter', 'RateSetter', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('hitachi personal finance', 'Hitachi Capital', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('hitachi capital', 'Hitachi Capital', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('novuna', 'Novuna', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  -- Credit Cards (repayment identifiers)
  ('amex payment', 'American Express', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('american express', 'American Express', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('barclaycard', 'Barclaycard', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('mbna', 'MBNA', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('capital one', 'Capital One', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('vanquis bank', 'Vanquis', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('aqua card', 'Aqua', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('tesco bank', 'Tesco Bank', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('virgin money', 'Virgin Money', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('sainsbury''s bank', 'Sainsbury''s Bank', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('hsbc card payment', 'HSBC', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('natwest card', 'NatWest', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('newday', 'NewDay', 'Bills & Utilities', 'lender', 'Credit Card', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- INSURANCE (subscription)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('aviva', 'Aviva', 'Insurance', 'subscription', 'Aviva', 'seed'),
  ('admiral', 'Admiral', 'Insurance', 'subscription', 'Admiral', 'seed'),
  ('direct line', 'Direct Line', 'Insurance', 'subscription', 'Direct Line', 'seed'),
  ('churchill', 'Churchill', 'Insurance', 'subscription', 'Churchill', 'seed'),
  ('more than', 'More Than', 'Insurance', 'subscription', 'More Than', 'seed'),
  ('axa insurance', 'AXA', 'Insurance', 'subscription', 'AXA', 'seed'),
  ('axa', 'AXA', 'Insurance', 'subscription', 'AXA', 'seed'),
  ('lv=', 'LV=', 'Insurance', 'subscription', 'LV=', 'seed'),
  ('legal & general', 'Legal & General', 'Insurance', 'subscription', 'Legal & General', 'seed'),
  ('zurich insurance', 'Zurich', 'Insurance', 'subscription', 'Zurich', 'seed'),
  ('hastings direct', 'Hastings Direct', 'Insurance', 'subscription', 'Hastings Direct', 'seed'),
  ('esure', 'esure', 'Insurance', 'subscription', 'esure', 'seed'),
  ('comparethemarket', 'Compare the Market', 'Insurance', 'subscription', 'Compare the Market', 'seed'),
  ('gocompare', 'GoCompare', 'Insurance', 'subscription', 'GoCompare', 'seed'),
  ('confused.com', 'Confused.com', 'Insurance', 'subscription', 'Confused.com', 'seed'),
  ('rac', 'RAC', 'Insurance', 'subscription', 'RAC', 'seed'),
  ('aa insurance', 'AA', 'Insurance', 'subscription', 'AA', 'seed'),
  ('green flag', 'Green Flag', 'Insurance', 'subscription', 'Green Flag', 'seed'),
  ('bupa', 'Bupa', 'Insurance', 'subscription', 'Bupa', 'seed'),
  ('vitality', 'Vitality', 'Insurance', 'subscription', 'Vitality', 'seed'),
  ('simply health', 'Simplyhealth', 'Insurance', 'subscription', 'Simplyhealth', 'seed'),
  ('petplan', 'Petplan', 'Insurance', 'subscription', 'Petplan', 'seed'),
  ('bought by many', 'Bought By Many', 'Insurance', 'subscription', 'Bought By Many', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- HEALTH & PERSONAL CARE
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('specsavers', 'Specsavers', 'Health', 'retailer', 'seed'),
  ('vision express', 'Vision Express', 'Health', 'retailer', 'seed'),
  ('nhs', 'NHS', 'Health', 'general', 'seed'),
  ('dentist', 'Dentist', 'Health', 'general', 'seed'),
  ('mydentist', 'myDentist', 'Health', 'general', 'seed'),
  ('pharmacy', 'Pharmacy', 'Health', 'general', 'seed'),
  ('lloyds pharmacy', 'Lloyds Pharmacy', 'Health', 'retailer', 'seed'),
  ('optical express', 'Optical Express', 'Health', 'retailer', 'seed'),
  ('holland & barrett', 'Holland & Barrett', 'Health', 'retailer', 'seed'),
  ('holland barrett', 'Holland & Barrett', 'Health', 'retailer', 'seed'),
  -- Barbers & Hair
  ('toni & guy', 'Toni & Guy', 'Personal Care', 'general', 'seed'),
  ('supercuts', 'Supercuts', 'Personal Care', 'general', 'seed'),
  ('rush hair', 'Rush Hair', 'Personal Care', 'general', 'seed'),
  ('headmasters', 'Headmasters', 'Personal Care', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- EDUCATION
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('udemy', 'Udemy', 'Education', 'general', 'seed'),
  ('coursera', 'Coursera', 'Education', 'general', 'seed'),
  ('skillshare', 'Skillshare', 'Education', 'general', 'seed'),
  ('linkedin learning', 'LinkedIn Learning', 'Education', 'general', 'seed'),
  ('masterclass', 'MasterClass', 'Education', 'general', 'seed'),
  ('duolingo', 'Duolingo', 'Education', 'subscription', 'seed'),
  ('brilliant.org', 'Brilliant', 'Education', 'general', 'seed'),
  ('codecademy', 'Codecademy', 'Education', 'general', 'seed'),
  ('pluralsight', 'Pluralsight', 'Education', 'general', 'seed'),
  ('open university', 'Open University', 'Education', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CHARITY & GIFTS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('justgiving', 'JustGiving', 'Gifts & Charity', 'general', 'seed'),
  ('gofundme', 'GoFundMe', 'Gifts & Charity', 'general', 'seed'),
  ('british heart foundation', 'British Heart Foundation', 'Gifts & Charity', 'general', 'seed'),
  ('cancer research', 'Cancer Research UK', 'Gifts & Charity', 'general', 'seed'),
  ('macmillan', 'Macmillan', 'Gifts & Charity', 'general', 'seed'),
  ('oxfam', 'Oxfam', 'Gifts & Charity', 'general', 'seed'),
  ('save the children', 'Save the Children', 'Gifts & Charity', 'general', 'seed'),
  ('red cross', 'Red Cross', 'Gifts & Charity', 'general', 'seed'),
  ('rspca', 'RSPCA', 'Gifts & Charity', 'general', 'seed'),
  ('moonpig', 'Moonpig', 'Gifts & Charity', 'retailer', 'seed'),
  ('funky pigeon', 'Funky Pigeon', 'Gifts & Charity', 'retailer', 'seed'),
  ('interflora', 'Interflora', 'Gifts & Charity', 'retailer', 'seed'),
  ('bloom & wild', 'Bloom & Wild', 'Gifts & Charity', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- TRAVEL & ACCOMMODATION
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('booking.com', 'Booking.com', 'Entertainment', 'general', 'seed'),
  ('airbnb', 'Airbnb', 'Entertainment', 'general', 'seed'),
  ('expedia', 'Expedia', 'Entertainment', 'general', 'seed'),
  ('hotels.com', 'Hotels.com', 'Entertainment', 'general', 'seed'),
  ('trivago', 'Trivago', 'Entertainment', 'general', 'seed'),
  ('lastminute.com', 'Lastminute.com', 'Entertainment', 'general', 'seed'),
  ('skyscanner', 'Skyscanner', 'Entertainment', 'general', 'seed'),
  ('travelodge', 'Travelodge', 'Entertainment', 'general', 'seed'),
  ('premier inn', 'Premier Inn', 'Entertainment', 'general', 'seed'),
  ('holiday inn', 'Holiday Inn', 'Entertainment', 'general', 'seed'),
  ('hilton', 'Hilton', 'Entertainment', 'general', 'seed'),
  ('marriott', 'Marriott', 'Entertainment', 'general', 'seed'),
  ('ibis', 'Ibis', 'Entertainment', 'general', 'seed'),
  ('haven holidays', 'Haven', 'Entertainment', 'general', 'seed'),
  ('center parcs', 'Center Parcs', 'Entertainment', 'general', 'seed'),
  ('butlins', 'Butlin''s', 'Entertainment', 'general', 'seed'),
  ('tui', 'TUI', 'Entertainment', 'general', 'seed'),
  ('loveholidays', 'Love Holidays', 'Entertainment', 'general', 'seed'),
  ('on the beach', 'On the Beach', 'Entertainment', 'general', 'seed'),
  ('enterprise rent', 'Enterprise', 'Transport', 'general', 'seed'),
  ('hertz', 'Hertz', 'Transport', 'general', 'seed'),
  ('europcar', 'Europcar', 'Transport', 'general', 'seed'),
  ('sixt', 'Sixt', 'Transport', 'general', 'seed'),
  ('avis', 'Avis', 'Transport', 'general', 'seed'),
  ('zipcar', 'Zipcar', 'Transport', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- ENTERTAINMENT (cinema, events, leisure)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('odeon', 'Odeon', 'Entertainment', 'general', 'seed'),
  ('cineworld', 'Cineworld', 'Entertainment', 'general', 'seed'),
  ('vue cinema', 'Vue', 'Entertainment', 'general', 'seed'),
  ('vue', 'Vue', 'Entertainment', 'general', 'seed'),
  ('curzon', 'Curzon', 'Entertainment', 'general', 'seed'),
  ('picturehouse', 'Picturehouse', 'Entertainment', 'general', 'seed'),
  ('everyman cinema', 'Everyman', 'Entertainment', 'general', 'seed'),
  ('ticketmaster', 'Ticketmaster', 'Entertainment', 'general', 'seed'),
  ('seetickets', 'See Tickets', 'Entertainment', 'general', 'seed'),
  ('stubhub', 'StubHub', 'Entertainment', 'general', 'seed'),
  ('dice.fm', 'DICE', 'Entertainment', 'general', 'seed'),
  ('eventbrite', 'Eventbrite', 'Entertainment', 'general', 'seed'),
  ('national trust', 'National Trust', 'Entertainment', 'general', 'seed'),
  ('english heritage', 'English Heritage', 'Entertainment', 'general', 'seed'),
  ('merlin entertainments', 'Merlin', 'Entertainment', 'general', 'seed'),
  ('alton towers', 'Alton Towers', 'Entertainment', 'general', 'seed'),
  ('thorpe park', 'Thorpe Park', 'Entertainment', 'general', 'seed'),
  ('legoland', 'LEGOLAND', 'Entertainment', 'general', 'seed'),
  ('madame tussauds', 'Madame Tussauds', 'Entertainment', 'general', 'seed'),
  ('london eye', 'London Eye', 'Entertainment', 'general', 'seed'),
  ('william hill', 'William Hill', 'Entertainment', 'general', 'seed'),
  ('bet365', 'Bet365', 'Entertainment', 'general', 'seed'),
  ('betfair', 'Betfair', 'Entertainment', 'general', 'seed'),
  ('paddy power', 'Paddy Power', 'Entertainment', 'general', 'seed'),
  ('sky bet', 'Sky Bet', 'Entertainment', 'general', 'seed'),
  ('national lottery', 'National Lottery', 'Entertainment', 'general', 'seed'),
  ('camelot', 'National Lottery', 'Entertainment', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- PAYMENT SERVICES & FINTECH (general)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('paypal', 'PayPal', 'Shopping', 'general', 'seed'),
  ('paypal *', 'PayPal', 'Shopping', 'general', 'seed'),
  ('google pay', 'Google Pay', 'Shopping', 'general', 'seed'),
  ('apple pay', 'Apple Pay', 'Shopping', 'general', 'seed'),
  ('wise', 'Wise', 'Bills & Utilities', 'general', 'seed'),
  ('transferwise', 'Wise', 'Bills & Utilities', 'general', 'seed'),
  ('revolut', 'Revolut', 'Bills & Utilities', 'general', 'seed'),
  ('monzo', 'Monzo', 'Bills & Utilities', 'general', 'seed'),
  ('starling bank', 'Starling', 'Bills & Utilities', 'general', 'seed'),
  ('curve', 'Curve', 'Bills & Utilities', 'general', 'seed'),
  ('chase uk', 'Chase', 'Bills & Utilities', 'general', 'seed'),
  ('western union', 'Western Union', 'Bills & Utilities', 'general', 'seed'),
  ('worldremit', 'WorldRemit', 'Bills & Utilities', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CAR-RELATED (MOT, servicing, parts)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('halfords', 'Halfords', 'Transport', 'retailer', 'seed'),
  ('kwik fit', 'Kwik Fit', 'Transport', 'general', 'seed'),
  ('ats euromaster', 'ATS', 'Transport', 'general', 'seed'),
  ('national tyres', 'National Tyres', 'Transport', 'general', 'seed'),
  ('dvla', 'DVLA', 'Transport', 'general', 'seed'),
  ('aa breakdown', 'AA', 'Transport', 'general', 'seed'),
  ('rac breakdown', 'RAC', 'Transport', 'general', 'seed'),
  ('green flag breakdown', 'Green Flag', 'Transport', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;
