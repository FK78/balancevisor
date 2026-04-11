-- Seed: Global merchant aliases — UK + worldwide brands.
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

-- ══════════════════════════════════════════════════════════════════════
-- WEBSITE URL ALIASES
-- Many bank statements show the merchant's URL instead of the name.
-- These map .com / .co.uk / .eu domains to their existing brands.
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Groceries
  ('tesco.com', 'Tesco', 'Groceries', 'grocery', 'seed'),
  ('sainsburys.co.uk', 'Sainsbury''s', 'Groceries', 'grocery', 'seed'),
  ('asda.com', 'Asda', 'Groceries', 'grocery', 'seed'),
  ('morrisons.com', 'Morrisons', 'Groceries', 'grocery', 'seed'),
  ('aldi.co.uk', 'Aldi', 'Groceries', 'grocery', 'seed'),
  ('lidl.co.uk', 'Lidl', 'Groceries', 'grocery', 'seed'),
  ('waitrose.com', 'Waitrose', 'Groceries', 'grocery', 'seed'),
  ('ocado.com', 'Ocado', 'Groceries', 'grocery', 'seed'),
  ('iceland.co.uk', 'Iceland', 'Groceries', 'grocery', 'seed'),
  ('costco.co.uk', 'Costco', 'Groceries', 'grocery', 'seed'),
  ('gousto.co.uk', 'Gousto', 'Groceries', 'grocery', 'seed'),
  ('hellofresh.co.uk', 'HelloFresh', 'Groceries', 'grocery', 'seed'),
  ('abelandcole.co.uk', 'Abel & Cole', 'Groceries', 'grocery', 'seed'),
  -- Restaurants & Delivery
  ('mcdonalds.com', 'McDonald''s', 'Dining Out', 'restaurant', 'seed'),
  ('mcdonalds.co.uk', 'McDonald''s', 'Dining Out', 'restaurant', 'seed'),
  ('burgerking.co.uk', 'Burger King', 'Dining Out', 'restaurant', 'seed'),
  ('kfc.co.uk', 'KFC', 'Dining Out', 'restaurant', 'seed'),
  ('subway.com', 'Subway', 'Dining Out', 'restaurant', 'seed'),
  ('greggs.co.uk', 'Greggs', 'Dining Out', 'restaurant', 'seed'),
  ('pret.co.uk', 'Pret A Manger', 'Dining Out', 'restaurant', 'seed'),
  ('nandos.co.uk', 'Nando''s', 'Dining Out', 'restaurant', 'seed'),
  ('pizzahut.co.uk', 'Pizza Hut', 'Dining Out', 'restaurant', 'seed'),
  ('dominos.co.uk', 'Domino''s', 'Dining Out', 'restaurant', 'seed'),
  ('wagamama.com', 'Wagamama', 'Dining Out', 'restaurant', 'seed'),
  ('fiveguys.co.uk', 'Five Guys', 'Dining Out', 'restaurant', 'seed'),
  ('pizzaexpress.com', 'Pizza Express', 'Dining Out', 'restaurant', 'seed'),
  ('deliveroo.co.uk', 'Deliveroo', 'Dining Out', 'restaurant', 'seed'),
  ('deliveroo.com', 'Deliveroo', 'Dining Out', 'restaurant', 'seed'),
  ('ubereats.com', 'Uber Eats', 'Dining Out', 'restaurant', 'seed'),
  ('just-eat.co.uk', 'Just Eat', 'Dining Out', 'restaurant', 'seed'),
  ('justeat.co.uk', 'Just Eat', 'Dining Out', 'restaurant', 'seed'),
  ('starbucks.co.uk', 'Starbucks', 'Dining Out', 'restaurant', 'seed'),
  ('costa.co.uk', 'Costa Coffee', 'Dining Out', 'restaurant', 'seed'),
  ('timhortons.co.uk', 'Tim Hortons', 'Dining Out', 'restaurant', 'seed'),
  -- Retailers
  ('amazon.com', 'Amazon', 'Shopping', 'retailer', 'seed'),
  ('ebay.co.uk', 'eBay', 'Shopping', 'retailer', 'seed'),
  ('ebay.com', 'eBay', 'Shopping', 'retailer', 'seed'),
  ('etsy.com', 'Etsy', 'Shopping', 'retailer', 'seed'),
  ('shein.com', 'Shein', 'Shopping', 'retailer', 'seed'),
  ('shein.co.uk', 'Shein', 'Shopping', 'retailer', 'seed'),
  ('temu.com', 'Temu', 'Shopping', 'retailer', 'seed'),
  ('vinted.co.uk', 'Vinted', 'Shopping', 'retailer', 'seed'),
  ('depop.com', 'Depop', 'Shopping', 'retailer', 'seed'),
  ('johnlewis.com', 'John Lewis', 'Shopping', 'retailer', 'seed'),
  ('marksandspencer.com', 'Marks & Spencer', 'Shopping', 'retailer', 'seed'),
  ('selfridges.com', 'Selfridges', 'Shopping', 'retailer', 'seed'),
  ('harrods.com', 'Harrods', 'Shopping', 'retailer', 'seed'),
  ('zara.com', 'Zara', 'Shopping', 'retailer', 'seed'),
  ('hm.com', 'H&M', 'Shopping', 'retailer', 'seed'),
  ('primark.com', 'Primark', 'Shopping', 'retailer', 'seed'),
  ('uniqlo.com', 'Uniqlo', 'Shopping', 'retailer', 'seed'),
  ('next.co.uk', 'Next', 'Shopping', 'retailer', 'seed'),
  ('newlook.com', 'New Look', 'Shopping', 'retailer', 'seed'),
  ('riverisland.com', 'River Island', 'Shopping', 'retailer', 'seed'),
  ('superdry.com', 'Superdry', 'Shopping', 'retailer', 'seed'),
  ('gap.co.uk', 'Gap', 'Shopping', 'retailer', 'seed'),
  ('jdsports.co.uk', 'JD Sports', 'Shopping', 'retailer', 'seed'),
  ('sportsdirect.com', 'Sports Direct', 'Shopping', 'retailer', 'seed'),
  ('adidas.co.uk', 'Adidas', 'Shopping', 'retailer', 'seed'),
  ('footlocker.co.uk', 'Foot Locker', 'Shopping', 'retailer', 'seed'),
  ('currys.co.uk', 'Currys', 'Shopping', 'retailer', 'seed'),
  ('argos.co.uk', 'Argos', 'Shopping', 'retailer', 'seed'),
  ('ikea.com', 'IKEA', 'Shopping', 'retailer', 'seed'),
  ('dunelm.com', 'Dunelm', 'Shopping', 'retailer', 'seed'),
  ('diy.com', 'B&Q', 'Shopping', 'retailer', 'seed'),
  ('homebase.co.uk', 'Homebase', 'Shopping', 'retailer', 'seed'),
  ('wickes.co.uk', 'Wickes', 'Shopping', 'retailer', 'seed'),
  ('screwfix.com', 'Screwfix', 'Shopping', 'retailer', 'seed'),
  ('tkmaxx.com', 'TK Maxx', 'Shopping', 'retailer', 'seed'),
  ('poundland.co.uk', 'Poundland', 'Shopping', 'retailer', 'seed'),
  ('waterstones.com', 'Waterstones', 'Shopping', 'retailer', 'seed'),
  ('boots.com', 'Boots', 'Shopping', 'retailer', 'seed'),
  ('superdrug.com', 'Superdrug', 'Shopping', 'retailer', 'seed'),
  ('lush.com', 'Lush', 'Shopping', 'retailer', 'seed'),
  ('spacenk.com', 'Space NK', 'Shopping', 'retailer', 'seed'),
  ('sephora.co.uk', 'Sephora', 'Shopping', 'retailer', 'seed'),
  ('petsathome.com', 'Pets at Home', 'Shopping', 'retailer', 'seed'),
  ('smythstoys.com', 'Smyths Toys', 'Shopping', 'retailer', 'seed'),
  ('samsung.com', 'Samsung', 'Shopping', 'retailer', 'seed'),
  ('apple.com', 'Apple Store', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- Subscriptions
  ('netflix.com/bill', 'Netflix', 'Entertainment', 'subscription', 'Netflix', 'seed'),
  ('disneyplus.com', 'Disney+', 'Entertainment', 'subscription', 'Disney+', 'seed'),
  ('spotify.com', 'Spotify', 'Entertainment', 'subscription', 'Spotify', 'seed'),
  ('music.apple.com', 'Apple Music', 'Entertainment', 'subscription', 'Apple Music', 'seed'),
  ('tidal.com', 'Tidal', 'Entertainment', 'subscription', 'Tidal', 'seed'),
  ('deezer.com', 'Deezer', 'Entertainment', 'subscription', 'Deezer', 'seed'),
  ('audible.co.uk', 'Audible', 'Entertainment', 'subscription', 'Audible', 'seed'),
  ('audible.com', 'Audible', 'Entertainment', 'subscription', 'Audible', 'seed'),
  ('nowtv.com', 'NOW TV', 'Entertainment', 'subscription', 'NOW TV', 'seed'),
  ('paramountplus.com', 'Paramount+', 'Entertainment', 'subscription', 'Paramount+', 'seed'),
  ('britbox.co.uk', 'BritBox', 'Entertainment', 'subscription', 'BritBox', 'seed'),
  ('mubi.com', 'MUBI', 'Entertainment', 'subscription', 'MUBI', 'seed'),
  ('crunchyroll.com', 'Crunchyroll', 'Entertainment', 'subscription', 'Crunchyroll', 'seed'),
  ('dazn.com', 'DAZN', 'Entertainment', 'subscription', 'DAZN', 'seed'),
  ('youtube.com', 'YouTube Premium', 'Entertainment', 'subscription', 'YouTube Premium', 'seed'),
  -- Software
  ('adobe.com', 'Adobe', 'Bills & Utilities', 'subscription', 'Adobe Creative Cloud', 'seed'),
  ('canva.com', 'Canva', 'Bills & Utilities', 'subscription', 'Canva Pro', 'seed'),
  ('notion.so', 'Notion', 'Bills & Utilities', 'subscription', 'Notion', 'seed'),
  ('dropbox.com', 'Dropbox', 'Bills & Utilities', 'subscription', 'Dropbox', 'seed'),
  ('openai.com', 'OpenAI', 'Bills & Utilities', 'subscription', 'ChatGPT Plus', 'seed'),
  ('1password.com', '1Password', 'Bills & Utilities', 'subscription', '1Password', 'seed'),
  ('nordvpn.com', 'NordVPN', 'Bills & Utilities', 'subscription', 'NordVPN', 'seed'),
  ('expressvpn.com', 'ExpressVPN', 'Bills & Utilities', 'subscription', 'ExpressVPN', 'seed'),
  -- News
  ('thetimes.co.uk', 'The Times', 'Entertainment', 'subscription', 'The Times', 'seed'),
  ('telegraph.co.uk', 'The Telegraph', 'Entertainment', 'subscription', 'The Telegraph', 'seed'),
  ('theathletic.com', 'The Athletic', 'Entertainment', 'subscription', 'The Athletic', 'seed'),
  ('theguardian.com', 'The Guardian', 'Entertainment', 'subscription', 'The Guardian', 'seed'),
  ('economist.com', 'The Economist', 'Entertainment', 'subscription', 'The Economist', 'seed'),
  -- Gyms & Fitness
  ('puregym.com', 'PureGym', 'Health', 'subscription', 'PureGym', 'seed'),
  ('thegymgroup.com', 'The Gym Group', 'Health', 'subscription', 'The Gym Group', 'seed'),
  ('davidlloyd.co.uk', 'David Lloyd', 'Health', 'subscription', 'David Lloyd', 'seed'),
  ('virginactive.co.uk', 'Virgin Active', 'Health', 'subscription', 'Virgin Active', 'seed'),
  ('nuffieldhealth.com', 'Nuffield Health', 'Health', 'subscription', 'Nuffield Health', 'seed'),
  ('classpass.com', 'ClassPass', 'Health', 'subscription', 'ClassPass', 'seed'),
  ('onepeloton.co.uk', 'Peloton', 'Health', 'subscription', 'Peloton', 'seed'),
  ('strava.com', 'Strava', 'Health', 'subscription', 'Strava', 'seed'),
  -- Dating
  ('tinder.com', 'Tinder', 'Entertainment', 'subscription', 'Tinder', 'seed'),
  ('bumble.com', 'Bumble', 'Entertainment', 'subscription', 'Bumble', 'seed'),
  ('hinge.co', 'Hinge', 'Entertainment', 'subscription', 'Hinge', 'seed'),
  -- Broadband / TV
  ('sky.com', 'Sky', 'Bills & Utilities', 'subscription', 'Sky', 'seed'),
  ('bt.com', 'BT', 'Bills & Utilities', 'subscription', 'BT Broadband', 'seed'),
  ('virginmedia.com', 'Virgin Media', 'Bills & Utilities', 'subscription', 'Virgin Media', 'seed'),
  ('talktalk.co.uk', 'TalkTalk', 'Bills & Utilities', 'subscription', 'TalkTalk', 'seed'),
  ('plusnet.com', 'Plusnet', 'Bills & Utilities', 'subscription', 'Plusnet', 'seed'),
  ('hyperoptic.com', 'Hyperoptic', 'Bills & Utilities', 'subscription', 'Hyperoptic', 'seed'),
  -- Mobile
  ('three.co.uk', 'Three', 'Bills & Utilities', 'subscription', 'Three Mobile', 'seed'),
  ('ee.co.uk', 'EE', 'Bills & Utilities', 'subscription', 'EE', 'seed'),
  ('vodafone.co.uk', 'Vodafone', 'Bills & Utilities', 'subscription', 'Vodafone', 'seed'),
  ('o2.co.uk', 'O2', 'Bills & Utilities', 'subscription', 'O2', 'seed'),
  ('giffgaff.com', 'giffgaff', 'Bills & Utilities', 'subscription', 'giffgaff', 'seed'),
  -- Insurance
  ('aviva.co.uk', 'Aviva', 'Insurance', 'subscription', 'Aviva', 'seed'),
  ('admiral.com', 'Admiral', 'Insurance', 'subscription', 'Admiral', 'seed'),
  ('directline.com', 'Direct Line', 'Insurance', 'subscription', 'Direct Line', 'seed'),
  ('axa.co.uk', 'AXA', 'Insurance', 'subscription', 'AXA', 'seed'),
  ('hastingsdirect.com', 'Hastings Direct', 'Insurance', 'subscription', 'Hastings Direct', 'seed'),
  ('bupa.co.uk', 'Bupa', 'Insurance', 'subscription', 'Bupa', 'seed'),
  ('vitality.co.uk', 'Vitality', 'Insurance', 'subscription', 'Vitality', 'seed'),
  ('rac.co.uk', 'RAC', 'Insurance', 'subscription', 'RAC', 'seed'),
  ('theaa.com', 'AA', 'Insurance', 'subscription', 'AA', 'seed')
ON CONFLICT (alias) DO NOTHING;

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Utilities
  ('britishgas.co.uk', 'British Gas', 'Bills & Utilities', 'utility', 'seed'),
  ('edfenergy.com', 'EDF Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('eonenergy.com', 'E.ON', 'Bills & Utilities', 'utility', 'seed'),
  ('scottishpower.co.uk', 'Scottish Power', 'Bills & Utilities', 'utility', 'seed'),
  ('octopus.energy', 'Octopus Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('ovoenergy.com', 'OVO Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('shellenergy.co.uk', 'Shell Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('thameswater.co.uk', 'Thames Water', 'Bills & Utilities', 'utility', 'seed'),
  ('stwater.co.uk', 'Severn Trent', 'Bills & Utilities', 'utility', 'seed'),
  ('unitedutilities.com', 'United Utilities', 'Bills & Utilities', 'utility', 'seed'),
  ('anglianwater.co.uk', 'Anglian Water', 'Bills & Utilities', 'utility', 'seed'),
  -- Transport
  ('uber.com', 'Uber', 'Transport', 'transport', 'seed'),
  ('bolt.eu', 'Bolt', 'Transport', 'transport', 'seed'),
  ('thetrainline.com', 'Trainline', 'Transport', 'transport', 'seed'),
  ('trainline.com', 'Trainline', 'Transport', 'transport', 'seed'),
  ('nationalexpress.com', 'National Express', 'Transport', 'transport', 'seed'),
  ('megabus.com', 'Megabus', 'Transport', 'transport', 'seed'),
  ('flixbus.co.uk', 'FlixBus', 'Transport', 'transport', 'seed'),
  ('britishairways.com', 'British Airways', 'Transport', 'transport', 'seed'),
  ('easyjet.com', 'easyJet', 'Transport', 'transport', 'seed'),
  ('ryanair.com', 'Ryanair', 'Transport', 'transport', 'seed'),
  ('jet2.com', 'Jet2', 'Transport', 'transport', 'seed'),
  ('wizzair.com', 'Wizz Air', 'Transport', 'transport', 'seed'),
  ('tui.co.uk', 'TUI', 'Transport', 'transport', 'seed'),
  ('virginatlantic.com', 'Virgin Atlantic', 'Transport', 'transport', 'seed'),
  ('justpark.com', 'JustPark', 'Transport', 'transport', 'seed'),
  ('ringgo.co.uk', 'RingGo', 'Transport', 'transport', 'seed'),
  ('li.me', 'Lime', 'Transport', 'transport', 'seed'),
  ('halfords.com', 'Halfords', 'Transport', 'retailer', 'seed'),
  -- Lenders / BNPL
  ('klarna.com', 'Klarna', 'Shopping', 'lender', 'seed'),
  ('clearpay.co.uk', 'Clearpay', 'Shopping', 'lender', 'seed'),
  ('zopa.com', 'Zopa', 'Bills & Utilities', 'lender', 'seed'),
  -- Travel
  ('booking.com', 'Booking.com', 'Entertainment', 'general', 'seed'),
  ('airbnb.co.uk', 'Airbnb', 'Entertainment', 'general', 'seed'),
  ('airbnb.com', 'Airbnb', 'Entertainment', 'general', 'seed'),
  ('expedia.co.uk', 'Expedia', 'Entertainment', 'general', 'seed'),
  ('hotels.com', 'Hotels.com', 'Entertainment', 'general', 'seed'),
  ('skyscanner.net', 'Skyscanner', 'Entertainment', 'general', 'seed'),
  ('travelodge.co.uk', 'Travelodge', 'Entertainment', 'general', 'seed'),
  ('premierinn.com', 'Premier Inn', 'Entertainment', 'general', 'seed'),
  ('loveholidays.com', 'Love Holidays', 'Entertainment', 'general', 'seed'),
  ('onthebeach.co.uk', 'On the Beach', 'Entertainment', 'general', 'seed'),
  ('centerparcs.co.uk', 'Center Parcs', 'Entertainment', 'general', 'seed'),
  ('zipcar.com', 'Zipcar', 'Transport', 'general', 'seed'),
  ('europcar.co.uk', 'Europcar', 'Transport', 'general', 'seed'),
  ('sixt.co.uk', 'Sixt', 'Transport', 'general', 'seed'),
  -- Entertainment
  ('odeon.co.uk', 'Odeon', 'Entertainment', 'general', 'seed'),
  ('cineworld.co.uk', 'Cineworld', 'Entertainment', 'general', 'seed'),
  ('myvue.com', 'Vue', 'Entertainment', 'general', 'seed'),
  ('ticketmaster.co.uk', 'Ticketmaster', 'Entertainment', 'general', 'seed'),
  ('seetickets.com', 'See Tickets', 'Entertainment', 'general', 'seed'),
  ('eventbrite.co.uk', 'Eventbrite', 'Entertainment', 'general', 'seed'),
  ('nationaltrust.org.uk', 'National Trust', 'Entertainment', 'general', 'seed'),
  -- Education
  ('udemy.com', 'Udemy', 'Education', 'general', 'seed'),
  ('coursera.org', 'Coursera', 'Education', 'general', 'seed'),
  ('skillshare.com', 'Skillshare', 'Education', 'general', 'seed'),
  ('masterclass.com', 'MasterClass', 'Education', 'general', 'seed'),
  ('duolingo.com', 'Duolingo', 'Education', 'subscription', 'seed'),
  ('brilliant.org', 'Brilliant', 'Education', 'general', 'seed'),
  -- Charity & Gifts
  ('justgiving.com', 'JustGiving', 'Gifts & Charity', 'general', 'seed'),
  ('gofundme.com', 'GoFundMe', 'Gifts & Charity', 'general', 'seed'),
  ('moonpig.com', 'Moonpig', 'Gifts & Charity', 'retailer', 'seed'),
  ('interflora.co.uk', 'Interflora', 'Gifts & Charity', 'retailer', 'seed'),
  ('bloomandwild.com', 'Bloom & Wild', 'Gifts & Charity', 'retailer', 'seed'),
  -- Health
  ('hollandandbarrett.com', 'Holland & Barrett', 'Health', 'retailer', 'seed'),
  ('specsavers.co.uk', 'Specsavers', 'Health', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- ██  WORLDWIDE BRANDS  ██
-- Global merchants not already covered by the UK section above.
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE GROCERIES & SUPERMARKETS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US
  ('walmart', 'Walmart', 'Groceries', 'grocery', 'seed'),
  ('walmart supercenter', 'Walmart', 'Groceries', 'grocery', 'seed'),
  ('wal-mart', 'Walmart', 'Groceries', 'grocery', 'seed'),
  ('walmart.com', 'Walmart', 'Groceries', 'grocery', 'seed'),
  ('kroger', 'Kroger', 'Groceries', 'grocery', 'seed'),
  ('kroger co', 'Kroger', 'Groceries', 'grocery', 'seed'),
  ('publix', 'Publix', 'Groceries', 'grocery', 'seed'),
  ('publix super market', 'Publix', 'Groceries', 'grocery', 'seed'),
  ('trader joe''s', 'Trader Joe''s', 'Groceries', 'grocery', 'seed'),
  ('trader joes', 'Trader Joe''s', 'Groceries', 'grocery', 'seed'),
  ('whole foods market', 'Whole Foods', 'Groceries', 'grocery', 'seed'),
  ('safeway', 'Safeway', 'Groceries', 'grocery', 'seed'),
  ('albertsons', 'Albertsons', 'Groceries', 'grocery', 'seed'),
  ('heb grocery', 'H-E-B', 'Groceries', 'grocery', 'seed'),
  ('h-e-b', 'H-E-B', 'Groceries', 'grocery', 'seed'),
  ('wegmans', 'Wegmans', 'Groceries', 'grocery', 'seed'),
  ('aldi us', 'Aldi', 'Groceries', 'grocery', 'seed'),
  ('target', 'Target', 'Groceries', 'grocery', 'seed'),
  ('target.com', 'Target', 'Groceries', 'grocery', 'seed'),
  ('sam''s club', 'Sam''s Club', 'Groceries', 'grocery', 'seed'),
  ('costco wholesale us', 'Costco', 'Groceries', 'grocery', 'seed'),
  ('sprouts farmers', 'Sprouts', 'Groceries', 'grocery', 'seed'),
  ('food lion', 'Food Lion', 'Groceries', 'grocery', 'seed'),
  ('stop & shop', 'Stop & Shop', 'Groceries', 'grocery', 'seed'),
  ('giant food', 'Giant', 'Groceries', 'grocery', 'seed'),
  ('winco foods', 'WinCo', 'Groceries', 'grocery', 'seed'),
  ('meijer', 'Meijer', 'Groceries', 'grocery', 'seed'),
  ('piggly wiggly', 'Piggly Wiggly', 'Groceries', 'grocery', 'seed'),
  ('harris teeter', 'Harris Teeter', 'Groceries', 'grocery', 'seed'),
  ('instacart', 'Instacart', 'Groceries', 'grocery', 'seed'),
  ('instacart.com', 'Instacart', 'Groceries', 'grocery', 'seed'),
  -- Europe
  ('carrefour', 'Carrefour', 'Groceries', 'grocery', 'seed'),
  ('carrefour.com', 'Carrefour', 'Groceries', 'grocery', 'seed'),
  ('leclerc', 'E.Leclerc', 'Groceries', 'grocery', 'seed'),
  ('e.leclerc', 'E.Leclerc', 'Groceries', 'grocery', 'seed'),
  ('auchan', 'Auchan', 'Groceries', 'grocery', 'seed'),
  ('intermarche', 'Intermarché', 'Groceries', 'grocery', 'seed'),
  ('monoprix', 'Monoprix', 'Groceries', 'grocery', 'seed'),
  ('casino supermarche', 'Casino', 'Groceries', 'grocery', 'seed'),
  ('franprix', 'Franprix', 'Groceries', 'grocery', 'seed'),
  ('albert heijn', 'Albert Heijn', 'Groceries', 'grocery', 'seed'),
  ('jumbo supermarkten', 'Jumbo', 'Groceries', 'grocery', 'seed'),
  ('rewe', 'REWE', 'Groceries', 'grocery', 'seed'),
  ('edeka', 'EDEKA', 'Groceries', 'grocery', 'seed'),
  ('penny markt', 'Penny', 'Groceries', 'grocery', 'seed'),
  ('netto marken', 'Netto', 'Groceries', 'grocery', 'seed'),
  ('kaufland', 'Kaufland', 'Groceries', 'grocery', 'seed'),
  ('mercadona', 'Mercadona', 'Groceries', 'grocery', 'seed'),
  ('dia supermarket', 'DIA', 'Groceries', 'grocery', 'seed'),
  ('el corte ingles', 'El Corte Inglés', 'Groceries', 'grocery', 'seed'),
  ('esselunga', 'Esselunga', 'Groceries', 'grocery', 'seed'),
  ('coop italia', 'Coop', 'Groceries', 'grocery', 'seed'),
  ('migros', 'Migros', 'Groceries', 'grocery', 'seed'),
  ('coop switzerland', 'Coop CH', 'Groceries', 'grocery', 'seed'),
  ('delhaize', 'Delhaize', 'Groceries', 'grocery', 'seed'),
  ('colruyt', 'Colruyt', 'Groceries', 'grocery', 'seed'),
  ('billa', 'Billa', 'Groceries', 'grocery', 'seed'),
  ('spar international', 'Spar', 'Groceries', 'grocery', 'seed'),
  -- Asia / Middle East
  ('lulu hypermarket', 'Lulu', 'Groceries', 'grocery', 'seed'),
  ('carrefour uae', 'Carrefour', 'Groceries', 'grocery', 'seed'),
  ('spinneys', 'Spinneys', 'Groceries', 'grocery', 'seed'),
  ('waitrose uae', 'Waitrose', 'Groceries', 'grocery', 'seed'),
  ('aeon', 'AEON', 'Groceries', 'grocery', 'seed'),
  ('don quijote', 'Don Quijote', 'Groceries', 'grocery', 'seed'),
  ('7-eleven', '7-Eleven', 'Groceries', 'grocery', 'seed'),
  ('7 eleven', '7-Eleven', 'Groceries', 'grocery', 'seed'),
  ('lawson', 'Lawson', 'Groceries', 'grocery', 'seed'),
  ('familymart', 'FamilyMart', 'Groceries', 'grocery', 'seed'),
  -- Australia / NZ
  ('woolworths', 'Woolworths', 'Groceries', 'grocery', 'seed'),
  ('woolworths au', 'Woolworths', 'Groceries', 'grocery', 'seed'),
  ('coles', 'Coles', 'Groceries', 'grocery', 'seed'),
  ('coles supermarket', 'Coles', 'Groceries', 'grocery', 'seed'),
  ('iga australia', 'IGA', 'Groceries', 'grocery', 'seed'),
  ('countdown nz', 'Countdown', 'Groceries', 'grocery', 'seed'),
  ('pak n save', 'PAK''nSAVE', 'Groceries', 'grocery', 'seed'),
  ('new world nz', 'New World', 'Groceries', 'grocery', 'seed'),
  -- Canada
  ('loblaws', 'Loblaws', 'Groceries', 'grocery', 'seed'),
  ('real canadian superstore', 'Superstore', 'Groceries', 'grocery', 'seed'),
  ('no frills', 'No Frills', 'Groceries', 'grocery', 'seed'),
  ('metro inc', 'Metro', 'Groceries', 'grocery', 'seed'),
  ('sobeys', 'Sobeys', 'Groceries', 'grocery', 'seed'),
  -- South Africa
  ('pick n pay', 'Pick n Pay', 'Groceries', 'grocery', 'seed'),
  ('checkers', 'Checkers', 'Groceries', 'grocery', 'seed'),
  ('shoprite', 'Shoprite', 'Groceries', 'grocery', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE RESTAURANTS & FAST FOOD
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US Chains (global)
  ('chick-fil-a', 'Chick-fil-A', 'Dining Out', 'restaurant', 'seed'),
  ('chick fil a', 'Chick-fil-A', 'Dining Out', 'restaurant', 'seed'),
  ('chipotle mexican grill', 'Chipotle', 'Dining Out', 'restaurant', 'seed'),
  ('chipotle.com', 'Chipotle', 'Dining Out', 'restaurant', 'seed'),
  ('panera bread', 'Panera Bread', 'Dining Out', 'restaurant', 'seed'),
  ('panera', 'Panera Bread', 'Dining Out', 'restaurant', 'seed'),
  ('wendy''s', 'Wendy''s', 'Dining Out', 'restaurant', 'seed'),
  ('wendys', 'Wendy''s', 'Dining Out', 'restaurant', 'seed'),
  ('taco bell', 'Taco Bell', 'Dining Out', 'restaurant', 'seed'),
  ('popeyes', 'Popeyes', 'Dining Out', 'restaurant', 'seed'),
  ('popeyes louisiana', 'Popeyes', 'Dining Out', 'restaurant', 'seed'),
  ('dunkin donuts', 'Dunkin''', 'Dining Out', 'restaurant', 'seed'),
  ('dunkin', 'Dunkin''', 'Dining Out', 'restaurant', 'seed'),
  ('jack in the box', 'Jack in the Box', 'Dining Out', 'restaurant', 'seed'),
  ('sonic drive-in', 'Sonic', 'Dining Out', 'restaurant', 'seed'),
  ('arby''s', 'Arby''s', 'Dining Out', 'restaurant', 'seed'),
  ('arbys', 'Arby''s', 'Dining Out', 'restaurant', 'seed'),
  ('dairy queen', 'Dairy Queen', 'Dining Out', 'restaurant', 'seed'),
  ('in-n-out', 'In-N-Out', 'Dining Out', 'restaurant', 'seed'),
  ('in n out burger', 'In-N-Out', 'Dining Out', 'restaurant', 'seed'),
  ('whataburger', 'Whataburger', 'Dining Out', 'restaurant', 'seed'),
  ('panda express', 'Panda Express', 'Dining Out', 'restaurant', 'seed'),
  ('olive garden', 'Olive Garden', 'Dining Out', 'restaurant', 'seed'),
  ('applebees', 'Applebee''s', 'Dining Out', 'restaurant', 'seed'),
  ('applebee''s', 'Applebee''s', 'Dining Out', 'restaurant', 'seed'),
  ('chilis', 'Chili''s', 'Dining Out', 'restaurant', 'seed'),
  ('chili''s', 'Chili''s', 'Dining Out', 'restaurant', 'seed'),
  ('ihop', 'IHOP', 'Dining Out', 'restaurant', 'seed'),
  ('denny''s', 'Denny''s', 'Dining Out', 'restaurant', 'seed'),
  ('dennys', 'Denny''s', 'Dining Out', 'restaurant', 'seed'),
  ('the cheesecake factory', 'The Cheesecake Factory', 'Dining Out', 'restaurant', 'seed'),
  ('cheesecake factory', 'The Cheesecake Factory', 'Dining Out', 'restaurant', 'seed'),
  ('outback steakhouse', 'Outback Steakhouse', 'Dining Out', 'restaurant', 'seed'),
  ('red lobster', 'Red Lobster', 'Dining Out', 'restaurant', 'seed'),
  ('cracker barrel', 'Cracker Barrel', 'Dining Out', 'restaurant', 'seed'),
  ('buffalo wild wings', 'Buffalo Wild Wings', 'Dining Out', 'restaurant', 'seed'),
  ('wingstop', 'Wingstop', 'Dining Out', 'restaurant', 'seed'),
  ('wingstop.com', 'Wingstop', 'Dining Out', 'restaurant', 'seed'),
  ('sweetgreen', 'Sweetgreen', 'Dining Out', 'restaurant', 'seed'),
  ('cava', 'CAVA', 'Dining Out', 'restaurant', 'seed'),
  ('shake shack', 'Shake Shack', 'Dining Out', 'restaurant', 'seed'),
  ('shakeshack.com', 'Shake Shack', 'Dining Out', 'restaurant', 'seed'),
  -- Coffee (global)
  ('starbucks.com', 'Starbucks', 'Dining Out', 'restaurant', 'seed'),
  ('costa.com', 'Costa Coffee', 'Dining Out', 'restaurant', 'seed'),
  -- Delivery (global)
  ('doordash', 'DoorDash', 'Dining Out', 'restaurant', 'seed'),
  ('doordash.com', 'DoorDash', 'Dining Out', 'restaurant', 'seed'),
  ('grubhub', 'Grubhub', 'Dining Out', 'restaurant', 'seed'),
  ('grubhub.com', 'Grubhub', 'Dining Out', 'restaurant', 'seed'),
  ('postmates', 'Postmates', 'Dining Out', 'restaurant', 'seed'),
  ('seamless', 'Seamless', 'Dining Out', 'restaurant', 'seed'),
  ('skip the dishes', 'SkipTheDishes', 'Dining Out', 'restaurant', 'seed'),
  ('skipthedishes', 'SkipTheDishes', 'Dining Out', 'restaurant', 'seed'),
  ('foodpanda', 'foodpanda', 'Dining Out', 'restaurant', 'seed'),
  ('swiggy', 'Swiggy', 'Dining Out', 'restaurant', 'seed'),
  ('zomato', 'Zomato', 'Dining Out', 'restaurant', 'seed'),
  ('talabat', 'Talabat', 'Dining Out', 'restaurant', 'seed'),
  ('rappi', 'Rappi', 'Dining Out', 'restaurant', 'seed'),
  ('ifood', 'iFood', 'Dining Out', 'restaurant', 'seed'),
  ('menulog', 'Menulog', 'Dining Out', 'restaurant', 'seed'),
  ('wolt', 'Wolt', 'Dining Out', 'restaurant', 'seed'),
  ('glovo', 'Glovo', 'Dining Out', 'restaurant', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE RETAILERS & SHOPPING
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US Retail
  ('best buy', 'Best Buy', 'Shopping', 'retailer', 'seed'),
  ('bestbuy.com', 'Best Buy', 'Shopping', 'retailer', 'seed'),
  ('home depot', 'Home Depot', 'Shopping', 'retailer', 'seed'),
  ('homedepot.com', 'Home Depot', 'Shopping', 'retailer', 'seed'),
  ('lowe''s', 'Lowe''s', 'Shopping', 'retailer', 'seed'),
  ('lowes', 'Lowe''s', 'Shopping', 'retailer', 'seed'),
  ('lowes.com', 'Lowe''s', 'Shopping', 'retailer', 'seed'),
  ('macy''s', 'Macy''s', 'Shopping', 'retailer', 'seed'),
  ('macys', 'Macy''s', 'Shopping', 'retailer', 'seed'),
  ('macys.com', 'Macy''s', 'Shopping', 'retailer', 'seed'),
  ('nordstrom', 'Nordstrom', 'Shopping', 'retailer', 'seed'),
  ('nordstrom.com', 'Nordstrom', 'Shopping', 'retailer', 'seed'),
  ('target stores', 'Target', 'Shopping', 'retailer', 'seed'),
  ('kohl''s', 'Kohl''s', 'Shopping', 'retailer', 'seed'),
  ('kohls', 'Kohl''s', 'Shopping', 'retailer', 'seed'),
  ('kohls.com', 'Kohl''s', 'Shopping', 'retailer', 'seed'),
  ('ross stores', 'Ross', 'Shopping', 'retailer', 'seed'),
  ('marshalls', 'Marshalls', 'Shopping', 'retailer', 'seed'),
  ('tj maxx', 'TJ Maxx', 'Shopping', 'retailer', 'seed'),
  ('tjmaxx.com', 'TJ Maxx', 'Shopping', 'retailer', 'seed'),
  ('dollar tree', 'Dollar Tree', 'Shopping', 'retailer', 'seed'),
  ('dollar general', 'Dollar General', 'Shopping', 'retailer', 'seed'),
  ('five below', 'Five Below', 'Shopping', 'retailer', 'seed'),
  ('bath & body works', 'Bath & Body Works', 'Shopping', 'retailer', 'seed'),
  ('victoria''s secret', 'Victoria''s Secret', 'Shopping', 'retailer', 'seed'),
  ('sephora.com', 'Sephora', 'Shopping', 'retailer', 'seed'),
  ('ulta beauty', 'Ulta', 'Shopping', 'retailer', 'seed'),
  ('ulta.com', 'Ulta', 'Shopping', 'retailer', 'seed'),
  ('bed bath beyond', 'Bed Bath & Beyond', 'Shopping', 'retailer', 'seed'),
  ('williams sonoma', 'Williams-Sonoma', 'Shopping', 'retailer', 'seed'),
  ('pottery barn', 'Pottery Barn', 'Shopping', 'retailer', 'seed'),
  ('restoration hardware', 'RH', 'Shopping', 'retailer', 'seed'),
  ('wayfair', 'Wayfair', 'Shopping', 'retailer', 'seed'),
  ('wayfair.com', 'Wayfair', 'Shopping', 'retailer', 'seed'),
  ('overstock', 'Overstock', 'Shopping', 'retailer', 'seed'),
  ('chewy.com', 'Chewy', 'Shopping', 'retailer', 'seed'),
  ('chewy', 'Chewy', 'Shopping', 'retailer', 'seed'),
  ('petco', 'Petco', 'Shopping', 'retailer', 'seed'),
  ('petsmart', 'PetSmart', 'Shopping', 'retailer', 'seed'),
  ('gamestop', 'GameStop', 'Shopping', 'retailer', 'seed'),
  -- Global Fashion
  ('louis vuitton', 'Louis Vuitton', 'Shopping', 'retailer', 'seed'),
  ('gucci', 'Gucci', 'Shopping', 'retailer', 'seed'),
  ('prada', 'Prada', 'Shopping', 'retailer', 'seed'),
  ('hermes', 'Hermès', 'Shopping', 'retailer', 'seed'),
  ('chanel', 'Chanel', 'Shopping', 'retailer', 'seed'),
  ('burberry', 'Burberry', 'Shopping', 'retailer', 'seed'),
  ('ralph lauren', 'Ralph Lauren', 'Shopping', 'retailer', 'seed'),
  ('tommy hilfiger', 'Tommy Hilfiger', 'Shopping', 'retailer', 'seed'),
  ('calvin klein', 'Calvin Klein', 'Shopping', 'retailer', 'seed'),
  ('hugo boss', 'Hugo Boss', 'Shopping', 'retailer', 'seed'),
  ('levi''s', 'Levi''s', 'Shopping', 'retailer', 'seed'),
  ('levis', 'Levi''s', 'Shopping', 'retailer', 'seed'),
  ('lululemon', 'Lululemon', 'Shopping', 'retailer', 'seed'),
  ('lululemon.com', 'Lululemon', 'Shopping', 'retailer', 'seed'),
  ('under armour', 'Under Armour', 'Shopping', 'retailer', 'seed'),
  ('underarmour.com', 'Under Armour', 'Shopping', 'retailer', 'seed'),
  ('the north face', 'The North Face', 'Shopping', 'retailer', 'seed'),
  ('patagonia', 'Patagonia', 'Shopping', 'retailer', 'seed'),
  ('forever 21', 'Forever 21', 'Shopping', 'retailer', 'seed'),
  ('urban outfitters', 'Urban Outfitters', 'Shopping', 'retailer', 'seed'),
  ('anthropologie', 'Anthropologie', 'Shopping', 'retailer', 'seed'),
  ('free people', 'Free People', 'Shopping', 'retailer', 'seed'),
  ('abercrombie & fitch', 'Abercrombie & Fitch', 'Shopping', 'retailer', 'seed'),
  ('hollister', 'Hollister', 'Shopping', 'retailer', 'seed'),
  ('old navy', 'Old Navy', 'Shopping', 'retailer', 'seed'),
  ('banana republic', 'Banana Republic', 'Shopping', 'retailer', 'seed'),
  ('j.crew', 'J.Crew', 'Shopping', 'retailer', 'seed'),
  -- Australia
  ('kmart au', 'Kmart', 'Shopping', 'retailer', 'seed'),
  ('big w', 'Big W', 'Shopping', 'retailer', 'seed'),
  ('bunnings', 'Bunnings', 'Shopping', 'retailer', 'seed'),
  ('bunnings warehouse', 'Bunnings', 'Shopping', 'retailer', 'seed'),
  ('jb hi-fi', 'JB Hi-Fi', 'Shopping', 'retailer', 'seed'),
  ('myer', 'Myer', 'Shopping', 'retailer', 'seed'),
  ('david jones', 'David Jones', 'Shopping', 'retailer', 'seed'),
  ('officeworks', 'Officeworks', 'Shopping', 'retailer', 'seed'),
  -- Global Tech
  ('microsoft store', 'Microsoft Store', 'Shopping', 'retailer', 'seed'),
  ('google store', 'Google Store', 'Shopping', 'retailer', 'seed'),
  ('store.google.com', 'Google Store', 'Shopping', 'retailer', 'seed'),
  -- Global Furniture
  ('ikea.com/au', 'IKEA', 'Shopping', 'retailer', 'seed'),
  ('ikea.com/us', 'IKEA', 'Shopping', 'retailer', 'seed'),
  -- Middle East
  ('noon', 'Noon', 'Shopping', 'retailer', 'seed'),
  ('noon.com', 'Noon', 'Shopping', 'retailer', 'seed'),
  ('namshi', 'Namshi', 'Shopping', 'retailer', 'seed'),
  ('namshi.com', 'Namshi', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE SUBSCRIPTIONS & STREAMING
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- Streaming (additional global)
  ('hbo max', 'HBO Max', 'Entertainment', 'subscription', 'HBO Max', 'seed'),
  ('max.com', 'Max', 'Entertainment', 'subscription', 'Max', 'seed'),
  ('hulu', 'Hulu', 'Entertainment', 'subscription', 'Hulu', 'seed'),
  ('hulu.com', 'Hulu', 'Entertainment', 'subscription', 'Hulu', 'seed'),
  ('peacock', 'Peacock', 'Entertainment', 'subscription', 'Peacock', 'seed'),
  ('peacocktv.com', 'Peacock', 'Entertainment', 'subscription', 'Peacock', 'seed'),
  ('fubo tv', 'FuboTV', 'Entertainment', 'subscription', 'FuboTV', 'seed'),
  ('sling tv', 'Sling TV', 'Entertainment', 'subscription', 'Sling TV', 'seed'),
  ('philo', 'Philo', 'Entertainment', 'subscription', 'Philo', 'seed'),
  ('curiositystream', 'CuriosityStream', 'Entertainment', 'subscription', 'CuriosityStream', 'seed'),
  ('showtime', 'Showtime', 'Entertainment', 'subscription', 'Showtime', 'seed'),
  ('starz', 'Starz', 'Entertainment', 'subscription', 'Starz', 'seed'),
  ('stan', 'Stan', 'Entertainment', 'subscription', 'Stan', 'seed'),
  ('binge', 'Binge', 'Entertainment', 'subscription', 'Binge', 'seed'),
  ('kayo sports', 'Kayo', 'Entertainment', 'subscription', 'Kayo Sports', 'seed'),
  ('foxtel', 'Foxtel', 'Entertainment', 'subscription', 'Foxtel', 'seed'),
  ('crave', 'Crave', 'Entertainment', 'subscription', 'Crave', 'seed'),
  ('shahid', 'Shahid', 'Entertainment', 'subscription', 'Shahid VIP', 'seed'),
  ('shahid.mbc.net', 'Shahid', 'Entertainment', 'subscription', 'Shahid VIP', 'seed'),
  ('osn', 'OSN', 'Entertainment', 'subscription', 'OSN+', 'seed'),
  ('hotstar', 'Hotstar', 'Entertainment', 'subscription', 'Hotstar', 'seed'),
  ('jiocinema', 'JioCinema', 'Entertainment', 'subscription', 'JioCinema', 'seed'),
  -- Music (additional global)
  ('soundcloud', 'SoundCloud', 'Entertainment', 'subscription', 'SoundCloud Go+', 'seed'),
  ('soundcloud.com', 'SoundCloud', 'Entertainment', 'subscription', 'SoundCloud Go+', 'seed'),
  ('pandora', 'Pandora', 'Entertainment', 'subscription', 'Pandora', 'seed'),
  ('sirius xm', 'SiriusXM', 'Entertainment', 'subscription', 'SiriusXM', 'seed'),
  ('siriusxm', 'SiriusXM', 'Entertainment', 'subscription', 'SiriusXM', 'seed'),
  ('anghami', 'Anghami', 'Entertainment', 'subscription', 'Anghami', 'seed'),
  -- Software / Productivity
  ('github', 'GitHub', 'Bills & Utilities', 'subscription', 'GitHub', 'seed'),
  ('github.com', 'GitHub', 'Bills & Utilities', 'subscription', 'GitHub', 'seed'),
  ('atlassian', 'Atlassian', 'Bills & Utilities', 'subscription', 'Atlassian', 'seed'),
  ('slack', 'Slack', 'Bills & Utilities', 'subscription', 'Slack', 'seed'),
  ('slack.com', 'Slack', 'Bills & Utilities', 'subscription', 'Slack', 'seed'),
  ('zoom.us', 'Zoom', 'Bills & Utilities', 'subscription', 'Zoom', 'seed'),
  ('zoom video', 'Zoom', 'Bills & Utilities', 'subscription', 'Zoom', 'seed'),
  ('figma', 'Figma', 'Bills & Utilities', 'subscription', 'Figma', 'seed'),
  ('figma.com', 'Figma', 'Bills & Utilities', 'subscription', 'Figma', 'seed'),
  ('linear', 'Linear', 'Bills & Utilities', 'subscription', 'Linear', 'seed'),
  ('vercel', 'Vercel', 'Bills & Utilities', 'subscription', 'Vercel', 'seed'),
  ('netlify', 'Netlify', 'Bills & Utilities', 'subscription', 'Netlify', 'seed'),
  ('grammarly', 'Grammarly', 'Bills & Utilities', 'subscription', 'Grammarly', 'seed'),
  ('grammarly.com', 'Grammarly', 'Bills & Utilities', 'subscription', 'Grammarly', 'seed'),
  ('evernote', 'Evernote', 'Bills & Utilities', 'subscription', 'Evernote', 'seed'),
  ('todoist', 'Todoist', 'Bills & Utilities', 'subscription', 'Todoist', 'seed'),
  ('bitwarden', 'Bitwarden', 'Bills & Utilities', 'subscription', 'Bitwarden', 'seed'),
  ('lastpass', 'LastPass', 'Bills & Utilities', 'subscription', 'LastPass', 'seed'),
  ('dashlane', 'Dashlane', 'Bills & Utilities', 'subscription', 'Dashlane', 'seed'),
  ('surfshark', 'Surfshark', 'Bills & Utilities', 'subscription', 'Surfshark', 'seed'),
  ('proton', 'Proton', 'Bills & Utilities', 'subscription', 'Proton', 'seed'),
  ('protonmail', 'Proton', 'Bills & Utilities', 'subscription', 'Proton', 'seed'),
  ('claude.ai', 'Anthropic', 'Bills & Utilities', 'subscription', 'Claude Pro', 'seed'),
  ('anthropic', 'Anthropic', 'Bills & Utilities', 'subscription', 'Claude Pro', 'seed'),
  ('midjourney', 'Midjourney', 'Bills & Utilities', 'subscription', 'Midjourney', 'seed'),
  -- News (global)
  ('nytimes', 'The New York Times', 'Entertainment', 'subscription', 'The New York Times', 'seed'),
  ('nytimes.com', 'The New York Times', 'Entertainment', 'subscription', 'The New York Times', 'seed'),
  ('new york times', 'The New York Times', 'Entertainment', 'subscription', 'The New York Times', 'seed'),
  ('washington post', 'The Washington Post', 'Entertainment', 'subscription', 'The Washington Post', 'seed'),
  ('washingtonpost.com', 'The Washington Post', 'Entertainment', 'subscription', 'The Washington Post', 'seed'),
  ('wall street journal', 'The Wall Street Journal', 'Entertainment', 'subscription', 'WSJ', 'seed'),
  ('wsj.com', 'The Wall Street Journal', 'Entertainment', 'subscription', 'WSJ', 'seed'),
  ('bloomberg', 'Bloomberg', 'Entertainment', 'subscription', 'Bloomberg', 'seed'),
  ('medium.com', 'Medium', 'Entertainment', 'subscription', 'Medium', 'seed'),
  ('medium', 'Medium', 'Entertainment', 'subscription', 'Medium', 'seed'),
  ('substack', 'Substack', 'Entertainment', 'subscription', 'Substack', 'seed'),
  ('substack.com', 'Substack', 'Entertainment', 'subscription', 'Substack', 'seed'),
  -- Fitness (global)
  ('planet fitness', 'Planet Fitness', 'Health', 'subscription', 'Planet Fitness', 'seed'),
  ('equinox', 'Equinox', 'Health', 'subscription', 'Equinox', 'seed'),
  ('orangetheory', 'Orangetheory', 'Health', 'subscription', 'Orangetheory', 'seed'),
  ('crossfit', 'CrossFit', 'Health', 'subscription', 'CrossFit', 'seed'),
  ('apple fitness', 'Apple Fitness+', 'Health', 'subscription', 'Apple Fitness+', 'seed'),
  ('apple fitness+', 'Apple Fitness+', 'Health', 'subscription', 'Apple Fitness+', 'seed'),
  ('fitbit premium', 'Fitbit', 'Health', 'subscription', 'Fitbit Premium', 'seed'),
  ('headspace', 'Headspace', 'Health', 'subscription', 'Headspace', 'seed'),
  ('headspace.com', 'Headspace', 'Health', 'subscription', 'Headspace', 'seed'),
  ('calm.com', 'Calm', 'Health', 'subscription', 'Calm', 'seed'),
  ('calm', 'Calm', 'Health', 'subscription', 'Calm', 'seed'),
  ('noom', 'Noom', 'Health', 'subscription', 'Noom', 'seed'),
  ('noom.com', 'Noom', 'Health', 'subscription', 'Noom', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE TRANSPORT
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Ride-hailing
  ('lyft', 'Lyft', 'Transport', 'transport', 'seed'),
  ('lyft.com', 'Lyft', 'Transport', 'transport', 'seed'),
  ('grab', 'Grab', 'Transport', 'transport', 'seed'),
  ('grab.com', 'Grab', 'Transport', 'transport', 'seed'),
  ('gojek', 'Gojek', 'Transport', 'transport', 'seed'),
  ('ola cabs', 'Ola', 'Transport', 'transport', 'seed'),
  ('ola', 'Ola', 'Transport', 'transport', 'seed'),
  ('careem', 'Careem', 'Transport', 'transport', 'seed'),
  ('careem.com', 'Careem', 'Transport', 'transport', 'seed'),
  ('didi', 'DiDi', 'Transport', 'transport', 'seed'),
  ('didi chuxing', 'DiDi', 'Transport', 'transport', 'seed'),
  ('cabify', 'Cabify', 'Transport', 'transport', 'seed'),
  ('99 taxi', '99', 'Transport', 'transport', 'seed'),
  -- Airlines (additional global)
  ('united airlines', 'United Airlines', 'Transport', 'transport', 'seed'),
  ('united.com', 'United Airlines', 'Transport', 'transport', 'seed'),
  ('delta air lines', 'Delta', 'Transport', 'transport', 'seed'),
  ('delta.com', 'Delta', 'Transport', 'transport', 'seed'),
  ('american airlines', 'American Airlines', 'Transport', 'transport', 'seed'),
  ('aa.com', 'American Airlines', 'Transport', 'transport', 'seed'),
  ('southwest airlines', 'Southwest', 'Transport', 'transport', 'seed'),
  ('southwest.com', 'Southwest', 'Transport', 'transport', 'seed'),
  ('jetblue', 'JetBlue', 'Transport', 'transport', 'seed'),
  ('jetblue.com', 'JetBlue', 'Transport', 'transport', 'seed'),
  ('spirit airlines', 'Spirit', 'Transport', 'transport', 'seed'),
  ('frontier airlines', 'Frontier', 'Transport', 'transport', 'seed'),
  ('alaska airlines', 'Alaska Airlines', 'Transport', 'transport', 'seed'),
  ('hawaiian airlines', 'Hawaiian Airlines', 'Transport', 'transport', 'seed'),
  ('air canada', 'Air Canada', 'Transport', 'transport', 'seed'),
  ('westjet', 'WestJet', 'Transport', 'transport', 'seed'),
  ('qantas', 'Qantas', 'Transport', 'transport', 'seed'),
  ('qantas.com', 'Qantas', 'Transport', 'transport', 'seed'),
  ('air new zealand', 'Air New Zealand', 'Transport', 'transport', 'seed'),
  ('singapore airlines', 'Singapore Airlines', 'Transport', 'transport', 'seed'),
  ('cathay pacific', 'Cathay Pacific', 'Transport', 'transport', 'seed'),
  ('japan airlines', 'Japan Airlines', 'Transport', 'transport', 'seed'),
  ('ana', 'ANA', 'Transport', 'transport', 'seed'),
  ('etihad', 'Etihad', 'Transport', 'transport', 'seed'),
  ('etihad airways', 'Etihad', 'Transport', 'transport', 'seed'),
  ('flydubai', 'flydubai', 'Transport', 'transport', 'seed'),
  ('air india', 'Air India', 'Transport', 'transport', 'seed'),
  ('indigo airlines', 'IndiGo', 'Transport', 'transport', 'seed'),
  ('latam airlines', 'LATAM', 'Transport', 'transport', 'seed'),
  ('avianca', 'Avianca', 'Transport', 'transport', 'seed'),
  ('volaris', 'Volaris', 'Transport', 'transport', 'seed'),
  ('aeromexico', 'Aeroméxico', 'Transport', 'transport', 'seed'),
  ('sas scandinavian', 'SAS', 'Transport', 'transport', 'seed'),
  ('norwegian air', 'Norwegian', 'Transport', 'transport', 'seed'),
  ('finnair', 'Finnair', 'Transport', 'transport', 'seed'),
  ('iberia', 'Iberia', 'Transport', 'transport', 'seed'),
  ('tap portugal', 'TAP', 'Transport', 'transport', 'seed'),
  ('swiss air', 'SWISS', 'Transport', 'transport', 'seed'),
  ('austrian airlines', 'Austrian Airlines', 'Transport', 'transport', 'seed'),
  ('south african airways', 'South African Airways', 'Transport', 'transport', 'seed'),
  ('kenya airways', 'Kenya Airways', 'Transport', 'transport', 'seed'),
  ('ethiopian airlines', 'Ethiopian Airlines', 'Transport', 'transport', 'seed'),
  -- Car Rental (global)
  ('enterprise.com', 'Enterprise', 'Transport', 'general', 'seed'),
  ('hertz.com', 'Hertz', 'Transport', 'general', 'seed'),
  ('budget car rental', 'Budget', 'Transport', 'general', 'seed'),
  ('budget.com', 'Budget', 'Transport', 'general', 'seed'),
  ('thrifty', 'Thrifty', 'Transport', 'general', 'seed'),
  ('national car rental', 'National', 'Transport', 'general', 'seed'),
  ('turo', 'Turo', 'Transport', 'general', 'seed'),
  ('turo.com', 'Turo', 'Transport', 'general', 'seed'),
  -- Public Transit (global)
  ('mta', 'MTA', 'Transport', 'transport', 'seed'),
  ('wmata', 'WMATA', 'Transport', 'transport', 'seed'),
  ('bart', 'BART', 'Transport', 'transport', 'seed'),
  ('cta', 'CTA', 'Transport', 'transport', 'seed'),
  ('marta', 'MARTA', 'Transport', 'transport', 'seed'),
  ('opal card', 'Opal', 'Transport', 'transport', 'seed'),
  ('myki', 'Myki', 'Transport', 'transport', 'seed'),
  ('nol card', 'NOL', 'Transport', 'transport', 'seed'),
  ('salik', 'Salik', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE LENDERS & FINANCIAL SERVICES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, lender_for, source) VALUES
  -- US Banks / Cards
  ('chase', 'Chase', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('chase.com', 'Chase', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('wells fargo', 'Wells Fargo', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('bank of america', 'Bank of America', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('citibank', 'Citi', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('citi card', 'Citi', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('discover', 'Discover', 'Bills & Utilities', 'lender', 'Credit Card', 'seed'),
  ('us bank', 'US Bank', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('pnc bank', 'PNC', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('truist', 'Truist', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('td bank', 'TD Bank', 'Bills & Utilities', 'lender', 'Mortgage', 'seed'),
  ('sofi', 'SoFi', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('sofi.com', 'SoFi', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('marcus by goldman', 'Marcus', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('lending club', 'LendingClub', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  ('upstart', 'Upstart', 'Bills & Utilities', 'lender', 'Personal Loan', 'seed'),
  -- BNPL (global)
  ('afterpay', 'Afterpay', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('afterpay.com', 'Afterpay', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('affirm', 'Affirm', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('affirm.com', 'Affirm', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('zip pay', 'Zip', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('zip co', 'Zip', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('sezzle', 'Sezzle', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('tabby', 'Tabby', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('tabby.ai', 'Tabby', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('tamara', 'Tamara', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  ('tamara.co', 'Tamara', 'Shopping', 'lender', 'Buy Now Pay Later', 'seed'),
  -- Student Loans (US)
  ('navient', 'Navient', 'Bills & Utilities', 'lender', 'Student Loan', 'seed'),
  ('nelnet', 'Nelnet', 'Bills & Utilities', 'lender', 'Student Loan', 'seed'),
  ('great lakes', 'Great Lakes', 'Bills & Utilities', 'lender', 'Student Loan', 'seed'),
  ('mohela', 'MOHELA', 'Bills & Utilities', 'lender', 'Student Loan', 'seed'),
  ('fedloan', 'FedLoan', 'Bills & Utilities', 'lender', 'Student Loan', 'seed')
ON CONFLICT (alias) DO NOTHING;

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Payment Services (global)
  ('venmo', 'Venmo', 'Bills & Utilities', 'general', 'seed'),
  ('cash app', 'Cash App', 'Bills & Utilities', 'general', 'seed'),
  ('cashapp', 'Cash App', 'Bills & Utilities', 'general', 'seed'),
  ('zelle', 'Zelle', 'Bills & Utilities', 'general', 'seed'),
  ('stripe', 'Stripe', 'Bills & Utilities', 'general', 'seed'),
  ('square', 'Square', 'Bills & Utilities', 'general', 'seed'),
  ('remitly', 'Remitly', 'Bills & Utilities', 'general', 'seed'),
  ('xe.com', 'XE', 'Bills & Utilities', 'general', 'seed'),
  ('payoneer', 'Payoneer', 'Bills & Utilities', 'general', 'seed'),
  ('n26', 'N26', 'Bills & Utilities', 'general', 'seed'),
  ('bunq', 'Bunq', 'Bills & Utilities', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE UTILITIES & TELCOS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- US Telcos
  ('at&t', 'AT&T', 'Bills & Utilities', 'subscription', 'AT&T', 'seed'),
  ('att', 'AT&T', 'Bills & Utilities', 'subscription', 'AT&T', 'seed'),
  ('at&t wireless', 'AT&T', 'Bills & Utilities', 'subscription', 'AT&T', 'seed'),
  ('verizon', 'Verizon', 'Bills & Utilities', 'subscription', 'Verizon', 'seed'),
  ('verizon wireless', 'Verizon', 'Bills & Utilities', 'subscription', 'Verizon', 'seed'),
  ('t-mobile', 'T-Mobile', 'Bills & Utilities', 'subscription', 'T-Mobile', 'seed'),
  ('t mobile', 'T-Mobile', 'Bills & Utilities', 'subscription', 'T-Mobile', 'seed'),
  ('sprint', 'Sprint', 'Bills & Utilities', 'subscription', 'Sprint', 'seed'),
  ('xfinity', 'Xfinity', 'Bills & Utilities', 'subscription', 'Xfinity', 'seed'),
  ('comcast', 'Xfinity', 'Bills & Utilities', 'subscription', 'Xfinity', 'seed'),
  ('spectrum', 'Spectrum', 'Bills & Utilities', 'subscription', 'Spectrum', 'seed'),
  ('cox communications', 'Cox', 'Bills & Utilities', 'subscription', 'Cox', 'seed'),
  ('google fiber', 'Google Fiber', 'Bills & Utilities', 'subscription', 'Google Fiber', 'seed'),
  ('mint mobile', 'Mint Mobile', 'Bills & Utilities', 'subscription', 'Mint Mobile', 'seed'),
  ('visible', 'Visible', 'Bills & Utilities', 'subscription', 'Visible', 'seed'),
  -- Canada Telcos
  ('rogers', 'Rogers', 'Bills & Utilities', 'subscription', 'Rogers', 'seed'),
  ('bell canada', 'Bell', 'Bills & Utilities', 'subscription', 'Bell', 'seed'),
  ('telus', 'TELUS', 'Bills & Utilities', 'subscription', 'TELUS', 'seed'),
  -- Australia Telcos
  ('telstra', 'Telstra', 'Bills & Utilities', 'subscription', 'Telstra', 'seed'),
  ('optus', 'Optus', 'Bills & Utilities', 'subscription', 'Optus', 'seed'),
  ('vodafone au', 'Vodafone AU', 'Bills & Utilities', 'subscription', 'Vodafone', 'seed'),
  ('tpg', 'TPG', 'Bills & Utilities', 'subscription', 'TPG', 'seed'),
  -- Middle East Telcos
  ('du telecom', 'du', 'Bills & Utilities', 'subscription', 'du', 'seed'),
  ('etisalat', 'Etisalat', 'Bills & Utilities', 'subscription', 'Etisalat', 'seed'),
  ('e& uae', 'e&', 'Bills & Utilities', 'subscription', 'e&', 'seed'),
  ('stc', 'STC', 'Bills & Utilities', 'subscription', 'STC', 'seed'),
  ('zain', 'Zain', 'Bills & Utilities', 'subscription', 'Zain', 'seed'),
  ('ooredoo', 'Ooredoo', 'Bills & Utilities', 'subscription', 'Ooredoo', 'seed'),
  -- India
  ('jio', 'Jio', 'Bills & Utilities', 'subscription', 'Jio', 'seed'),
  ('airtel', 'Airtel', 'Bills & Utilities', 'subscription', 'Airtel', 'seed'),
  ('vi india', 'Vi', 'Bills & Utilities', 'subscription', 'Vi', 'seed'),
  -- Global Internet
  ('starlink', 'Starlink', 'Bills & Utilities', 'subscription', 'Starlink', 'seed'),
  ('starlink.com', 'Starlink', 'Bills & Utilities', 'subscription', 'Starlink', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE INSURANCE
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- US
  ('geico', 'GEICO', 'Insurance', 'subscription', 'GEICO', 'seed'),
  ('state farm', 'State Farm', 'Insurance', 'subscription', 'State Farm', 'seed'),
  ('progressive', 'Progressive', 'Insurance', 'subscription', 'Progressive', 'seed'),
  ('allstate', 'Allstate', 'Insurance', 'subscription', 'Allstate', 'seed'),
  ('liberty mutual', 'Liberty Mutual', 'Insurance', 'subscription', 'Liberty Mutual', 'seed'),
  ('usaa', 'USAA', 'Insurance', 'subscription', 'USAA', 'seed'),
  ('farmers insurance', 'Farmers', 'Insurance', 'subscription', 'Farmers', 'seed'),
  ('nationwide insurance', 'Nationwide', 'Insurance', 'subscription', 'Nationwide', 'seed'),
  ('travelers', 'Travelers', 'Insurance', 'subscription', 'Travelers', 'seed'),
  ('lemonade', 'Lemonade', 'Insurance', 'subscription', 'Lemonade', 'seed'),
  ('lemonade.com', 'Lemonade', 'Insurance', 'subscription', 'Lemonade', 'seed'),
  ('root insurance', 'Root', 'Insurance', 'subscription', 'Root', 'seed'),
  ('oscar health', 'Oscar Health', 'Insurance', 'subscription', 'Oscar Health', 'seed'),
  -- Global
  ('allianz', 'Allianz', 'Insurance', 'subscription', 'Allianz', 'seed'),
  ('generali', 'Generali', 'Insurance', 'subscription', 'Generali', 'seed'),
  ('aig', 'AIG', 'Insurance', 'subscription', 'AIG', 'seed'),
  ('metlife', 'MetLife', 'Insurance', 'subscription', 'MetLife', 'seed'),
  ('prudential', 'Prudential', 'Insurance', 'subscription', 'Prudential', 'seed'),
  ('manulife', 'Manulife', 'Insurance', 'subscription', 'Manulife', 'seed'),
  ('sun life', 'Sun Life', 'Insurance', 'subscription', 'Sun Life', 'seed'),
  ('cigna', 'Cigna', 'Insurance', 'subscription', 'Cigna', 'seed'),
  ('anthem', 'Anthem', 'Insurance', 'subscription', 'Anthem', 'seed'),
  ('unitedhealthcare', 'UnitedHealthcare', 'Insurance', 'subscription', 'UnitedHealthcare', 'seed'),
  ('kaiser permanente', 'Kaiser Permanente', 'Insurance', 'subscription', 'Kaiser Permanente', 'seed'),
  ('blue cross', 'Blue Cross', 'Insurance', 'subscription', 'Blue Cross', 'seed'),
  ('blue shield', 'Blue Shield', 'Insurance', 'subscription', 'Blue Shield', 'seed'),
  -- Australia
  ('medibank', 'Medibank', 'Insurance', 'subscription', 'Medibank', 'seed'),
  ('nrma', 'NRMA', 'Insurance', 'subscription', 'NRMA', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE EDUCATION
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('khan academy', 'Khan Academy', 'Education', 'general', 'seed'),
  ('khanacademy.org', 'Khan Academy', 'Education', 'general', 'seed'),
  ('edx', 'edX', 'Education', 'general', 'seed'),
  ('edx.org', 'edX', 'Education', 'general', 'seed'),
  ('babbel', 'Babbel', 'Education', 'general', 'seed'),
  ('babbel.com', 'Babbel', 'Education', 'general', 'seed'),
  ('rosetta stone', 'Rosetta Stone', 'Education', 'general', 'seed'),
  ('datacamp', 'DataCamp', 'Education', 'general', 'seed'),
  ('datacamp.com', 'DataCamp', 'Education', 'general', 'seed'),
  ('o''reilly media', 'O''Reilly', 'Education', 'general', 'seed'),
  ('blinkist', 'Blinkist', 'Education', 'general', 'seed'),
  ('blinkist.com', 'Blinkist', 'Education', 'general', 'seed'),
  ('kindle unlimited', 'Kindle Unlimited', 'Education', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE ENTERTAINMENT & TRAVEL
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Hotels (global)
  ('marriott.com', 'Marriott', 'Entertainment', 'general', 'seed'),
  ('hilton.com', 'Hilton', 'Entertainment', 'general', 'seed'),
  ('ihg', 'IHG', 'Entertainment', 'general', 'seed'),
  ('ihg.com', 'IHG', 'Entertainment', 'general', 'seed'),
  ('hyatt', 'Hyatt', 'Entertainment', 'general', 'seed'),
  ('hyatt.com', 'Hyatt', 'Entertainment', 'general', 'seed'),
  ('accor', 'Accor', 'Entertainment', 'general', 'seed'),
  ('accor.com', 'Accor', 'Entertainment', 'general', 'seed'),
  ('radisson', 'Radisson', 'Entertainment', 'general', 'seed'),
  ('best western', 'Best Western', 'Entertainment', 'general', 'seed'),
  ('four seasons', 'Four Seasons', 'Entertainment', 'general', 'seed'),
  ('ritz carlton', 'The Ritz-Carlton', 'Entertainment', 'general', 'seed'),
  ('w hotel', 'W Hotels', 'Entertainment', 'general', 'seed'),
  ('hostelworld', 'Hostelworld', 'Entertainment', 'general', 'seed'),
  ('hostelworld.com', 'Hostelworld', 'Entertainment', 'general', 'seed'),
  ('vrbo', 'VRBO', 'Entertainment', 'general', 'seed'),
  ('vrbo.com', 'VRBO', 'Entertainment', 'general', 'seed'),
  -- Travel OTAs
  ('trip.com', 'Trip.com', 'Entertainment', 'general', 'seed'),
  ('agoda', 'Agoda', 'Entertainment', 'general', 'seed'),
  ('agoda.com', 'Agoda', 'Entertainment', 'general', 'seed'),
  ('kayak', 'Kayak', 'Entertainment', 'general', 'seed'),
  ('kayak.com', 'Kayak', 'Entertainment', 'general', 'seed'),
  ('hopper', 'Hopper', 'Entertainment', 'general', 'seed'),
  ('hopper.com', 'Hopper', 'Entertainment', 'general', 'seed'),
  ('tripadvisor', 'Tripadvisor', 'Entertainment', 'general', 'seed'),
  ('viator', 'Viator', 'Entertainment', 'general', 'seed'),
  ('getyourguide', 'GetYourGuide', 'Entertainment', 'general', 'seed'),
  ('getyourguide.com', 'GetYourGuide', 'Entertainment', 'general', 'seed'),
  ('klook', 'Klook', 'Entertainment', 'general', 'seed'),
  ('klook.com', 'Klook', 'Entertainment', 'general', 'seed'),
  -- Entertainment (global)
  ('amc theatres', 'AMC', 'Entertainment', 'general', 'seed'),
  ('regal cinemas', 'Regal', 'Entertainment', 'general', 'seed'),
  ('cinemark', 'Cinemark', 'Entertainment', 'general', 'seed'),
  ('imax', 'IMAX', 'Entertainment', 'general', 'seed'),
  ('axs.com', 'AXS', 'Entertainment', 'general', 'seed'),
  ('live nation', 'Live Nation', 'Entertainment', 'general', 'seed'),
  ('stubhub.com', 'StubHub', 'Entertainment', 'general', 'seed'),
  ('viagogo', 'Viagogo', 'Entertainment', 'general', 'seed'),
  -- Theme Parks
  ('disneyland', 'Disney Parks', 'Entertainment', 'general', 'seed'),
  ('disney world', 'Disney Parks', 'Entertainment', 'general', 'seed'),
  ('walt disney world', 'Disney Parks', 'Entertainment', 'general', 'seed'),
  ('universal studios', 'Universal Studios', 'Entertainment', 'general', 'seed'),
  ('universal orlando', 'Universal Studios', 'Entertainment', 'general', 'seed'),
  ('six flags', 'Six Flags', 'Entertainment', 'general', 'seed'),
  ('cedar point', 'Cedar Fair', 'Entertainment', 'general', 'seed'),
  ('legoland.com', 'LEGOLAND', 'Entertainment', 'general', 'seed'),
  ('seaworld', 'SeaWorld', 'Entertainment', 'general', 'seed'),
  -- Gambling (global)
  ('draftkings', 'DraftKings', 'Entertainment', 'general', 'seed'),
  ('draftkings.com', 'DraftKings', 'Entertainment', 'general', 'seed'),
  ('fanduel', 'FanDuel', 'Entertainment', 'general', 'seed'),
  ('fanduel.com', 'FanDuel', 'Entertainment', 'general', 'seed'),
  ('betmgm', 'BetMGM', 'Entertainment', 'general', 'seed'),
  ('pokerstars', 'PokerStars', 'Entertainment', 'general', 'seed'),
  ('888sport', '888sport', 'Entertainment', 'general', 'seed'),
  ('unibet', 'Unibet', 'Entertainment', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WORLDWIDE CHARITY
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('unicef', 'UNICEF', 'Gifts & Charity', 'general', 'seed'),
  ('world vision', 'World Vision', 'Gifts & Charity', 'general', 'seed'),
  ('doctors without borders', 'MSF', 'Gifts & Charity', 'general', 'seed'),
  ('msf', 'MSF', 'Gifts & Charity', 'general', 'seed'),
  ('amnesty international', 'Amnesty International', 'Gifts & Charity', 'general', 'seed'),
  ('wwf', 'WWF', 'Gifts & Charity', 'general', 'seed'),
  ('greenpeace', 'Greenpeace', 'Gifts & Charity', 'general', 'seed'),
  ('wikimedia', 'Wikipedia', 'Gifts & Charity', 'general', 'seed'),
  ('wikipedia', 'Wikipedia', 'Gifts & Charity', 'general', 'seed'),
  ('patreon', 'Patreon', 'Gifts & Charity', 'general', 'seed'),
  ('patreon.com', 'Patreon', 'Gifts & Charity', 'general', 'seed'),
  ('ko-fi', 'Ko-fi', 'Gifts & Charity', 'general', 'seed'),
  ('buymeacoffee', 'Buy Me a Coffee', 'Gifts & Charity', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;
