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

-- ══════════════════════════════════════════════════════════════════════
-- ██  EXTENDED COVERAGE  ██
-- Additional categories and niche merchants worldwide.
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- GAMING & DIGITAL STORES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- Platforms
  ('steam', 'Steam', 'Entertainment', 'general', NULL, 'seed'),
  ('steampowered.com', 'Steam', 'Entertainment', 'general', NULL, 'seed'),
  ('valve steam', 'Steam', 'Entertainment', 'general', NULL, 'seed'),
  ('epic games', 'Epic Games', 'Entertainment', 'general', NULL, 'seed'),
  ('epicgames.com', 'Epic Games', 'Entertainment', 'general', NULL, 'seed'),
  ('playstation network', 'PlayStation', 'Entertainment', 'subscription', 'PS Plus', 'seed'),
  ('playstation store', 'PlayStation', 'Entertainment', 'general', NULL, 'seed'),
  ('sony playstation', 'PlayStation', 'Entertainment', 'general', NULL, 'seed'),
  ('psn', 'PlayStation', 'Entertainment', 'general', NULL, 'seed'),
  ('xbox', 'Xbox', 'Entertainment', 'subscription', 'Xbox Game Pass', 'seed'),
  ('xbox game pass', 'Xbox', 'Entertainment', 'subscription', 'Xbox Game Pass', 'seed'),
  ('microsoft xbox', 'Xbox', 'Entertainment', 'general', NULL, 'seed'),
  ('nintendo', 'Nintendo', 'Entertainment', 'general', NULL, 'seed'),
  ('nintendo eshop', 'Nintendo', 'Entertainment', 'general', NULL, 'seed'),
  ('nintendo switch online', 'Nintendo', 'Entertainment', 'subscription', 'Nintendo Switch Online', 'seed'),
  ('gog.com', 'GOG', 'Entertainment', 'general', NULL, 'seed'),
  ('humble bundle', 'Humble Bundle', 'Entertainment', 'general', NULL, 'seed'),
  ('humblebundle.com', 'Humble Bundle', 'Entertainment', 'general', NULL, 'seed'),
  -- Publishers / Services
  ('ea.com', 'EA', 'Entertainment', 'subscription', 'EA Play', 'seed'),
  ('electronic arts', 'EA', 'Entertainment', 'general', NULL, 'seed'),
  ('ea play', 'EA', 'Entertainment', 'subscription', 'EA Play', 'seed'),
  ('ubisoft', 'Ubisoft', 'Entertainment', 'general', NULL, 'seed'),
  ('activision', 'Activision Blizzard', 'Entertainment', 'general', NULL, 'seed'),
  ('blizzard entertainment', 'Activision Blizzard', 'Entertainment', 'general', NULL, 'seed'),
  ('riot games', 'Riot Games', 'Entertainment', 'general', NULL, 'seed'),
  ('roblox', 'Roblox', 'Entertainment', 'general', NULL, 'seed'),
  ('roblox.com', 'Roblox', 'Entertainment', 'general', NULL, 'seed'),
  ('twitch', 'Twitch', 'Entertainment', 'subscription', 'Twitch', 'seed'),
  ('twitch.tv', 'Twitch', 'Entertainment', 'subscription', 'Twitch', 'seed'),
  -- App Stores
  ('google play', 'Google Play', 'Entertainment', 'general', NULL, 'seed'),
  ('google*play', 'Google Play', 'Entertainment', 'general', NULL, 'seed'),
  ('apple.com/bill', 'Apple', 'Entertainment', 'general', NULL, 'seed'),
  ('itunes', 'Apple', 'Entertainment', 'general', NULL, 'seed'),
  ('apple itunes', 'Apple', 'Entertainment', 'general', NULL, 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CLOUD / SAAS / DEVELOPER TOOLS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('aws', 'AWS', 'Bills & Utilities', 'subscription', 'AWS', 'seed'),
  ('amazon web services', 'AWS', 'Bills & Utilities', 'subscription', 'AWS', 'seed'),
  ('google cloud', 'Google Cloud', 'Bills & Utilities', 'subscription', 'Google Cloud', 'seed'),
  ('gcp', 'Google Cloud', 'Bills & Utilities', 'subscription', 'Google Cloud', 'seed'),
  ('microsoft azure', 'Azure', 'Bills & Utilities', 'subscription', 'Azure', 'seed'),
  ('azure', 'Azure', 'Bills & Utilities', 'subscription', 'Azure', 'seed'),
  ('digitalocean', 'DigitalOcean', 'Bills & Utilities', 'subscription', 'DigitalOcean', 'seed'),
  ('digitalocean.com', 'DigitalOcean', 'Bills & Utilities', 'subscription', 'DigitalOcean', 'seed'),
  ('cloudflare', 'Cloudflare', 'Bills & Utilities', 'subscription', 'Cloudflare', 'seed'),
  ('cloudflare.com', 'Cloudflare', 'Bills & Utilities', 'subscription', 'Cloudflare', 'seed'),
  ('heroku', 'Heroku', 'Bills & Utilities', 'subscription', 'Heroku', 'seed'),
  ('linode', 'Linode', 'Bills & Utilities', 'subscription', 'Linode', 'seed'),
  ('vultr', 'Vultr', 'Bills & Utilities', 'subscription', 'Vultr', 'seed'),
  ('hetzner', 'Hetzner', 'Bills & Utilities', 'subscription', 'Hetzner', 'seed'),
  ('railway.app', 'Railway', 'Bills & Utilities', 'subscription', 'Railway', 'seed'),
  ('render.com', 'Render', 'Bills & Utilities', 'subscription', 'Render', 'seed'),
  ('fly.io', 'Fly.io', 'Bills & Utilities', 'subscription', 'Fly.io', 'seed'),
  ('supabase', 'Supabase', 'Bills & Utilities', 'subscription', 'Supabase', 'seed'),
  ('supabase.com', 'Supabase', 'Bills & Utilities', 'subscription', 'Supabase', 'seed'),
  ('planetscale', 'PlanetScale', 'Bills & Utilities', 'subscription', 'PlanetScale', 'seed'),
  ('mongodb', 'MongoDB', 'Bills & Utilities', 'subscription', 'MongoDB Atlas', 'seed'),
  ('mongodb.com', 'MongoDB', 'Bills & Utilities', 'subscription', 'MongoDB Atlas', 'seed'),
  ('jetbrains', 'JetBrains', 'Bills & Utilities', 'subscription', 'JetBrains', 'seed'),
  ('jetbrains.com', 'JetBrains', 'Bills & Utilities', 'subscription', 'JetBrains', 'seed'),
  ('microsoft 365', 'Microsoft 365', 'Bills & Utilities', 'subscription', 'Microsoft 365', 'seed'),
  ('office 365', 'Microsoft 365', 'Bills & Utilities', 'subscription', 'Microsoft 365', 'seed'),
  ('google workspace', 'Google Workspace', 'Bills & Utilities', 'subscription', 'Google Workspace', 'seed'),
  ('google one', 'Google One', 'Bills & Utilities', 'subscription', 'Google One', 'seed'),
  ('icloud', 'iCloud', 'Bills & Utilities', 'subscription', 'iCloud+', 'seed'),
  ('icloud+', 'iCloud', 'Bills & Utilities', 'subscription', 'iCloud+', 'seed'),
  ('apple icloud', 'iCloud', 'Bills & Utilities', 'subscription', 'iCloud+', 'seed'),
  ('mailchimp', 'Mailchimp', 'Bills & Utilities', 'subscription', 'Mailchimp', 'seed'),
  ('hubspot', 'HubSpot', 'Bills & Utilities', 'subscription', 'HubSpot', 'seed'),
  ('salesforce', 'Salesforce', 'Bills & Utilities', 'subscription', 'Salesforce', 'seed'),
  ('shopify', 'Shopify', 'Bills & Utilities', 'subscription', 'Shopify', 'seed'),
  ('shopify.com', 'Shopify', 'Bills & Utilities', 'subscription', 'Shopify', 'seed'),
  ('squarespace', 'Squarespace', 'Bills & Utilities', 'subscription', 'Squarespace', 'seed'),
  ('squarespace.com', 'Squarespace', 'Bills & Utilities', 'subscription', 'Squarespace', 'seed'),
  ('wix', 'Wix', 'Bills & Utilities', 'subscription', 'Wix', 'seed'),
  ('wix.com', 'Wix', 'Bills & Utilities', 'subscription', 'Wix', 'seed'),
  ('wordpress.com', 'WordPress', 'Bills & Utilities', 'subscription', 'WordPress', 'seed'),
  ('godaddy', 'GoDaddy', 'Bills & Utilities', 'subscription', 'GoDaddy', 'seed'),
  ('godaddy.com', 'GoDaddy', 'Bills & Utilities', 'subscription', 'GoDaddy', 'seed'),
  ('namecheap', 'Namecheap', 'Bills & Utilities', 'subscription', 'Namecheap', 'seed'),
  ('namecheap.com', 'Namecheap', 'Bills & Utilities', 'subscription', 'Namecheap', 'seed'),
  ('hover', 'Hover', 'Bills & Utilities', 'subscription', 'Hover', 'seed'),
  ('sendgrid', 'SendGrid', 'Bills & Utilities', 'subscription', 'SendGrid', 'seed'),
  ('twilio', 'Twilio', 'Bills & Utilities', 'subscription', 'Twilio', 'seed'),
  ('datadog', 'Datadog', 'Bills & Utilities', 'subscription', 'Datadog', 'seed'),
  ('sentry.io', 'Sentry', 'Bills & Utilities', 'subscription', 'Sentry', 'seed'),
  ('new relic', 'New Relic', 'Bills & Utilities', 'subscription', 'New Relic', 'seed'),
  ('zapier', 'Zapier', 'Bills & Utilities', 'subscription', 'Zapier', 'seed'),
  ('zapier.com', 'Zapier', 'Bills & Utilities', 'subscription', 'Zapier', 'seed'),
  ('airtable', 'Airtable', 'Bills & Utilities', 'subscription', 'Airtable', 'seed'),
  ('monday.com', 'Monday.com', 'Bills & Utilities', 'subscription', 'Monday.com', 'seed'),
  ('asana', 'Asana', 'Bills & Utilities', 'subscription', 'Asana', 'seed'),
  ('clickup', 'ClickUp', 'Bills & Utilities', 'subscription', 'ClickUp', 'seed'),
  ('miro', 'Miro', 'Bills & Utilities', 'subscription', 'Miro', 'seed'),
  ('miro.com', 'Miro', 'Bills & Utilities', 'subscription', 'Miro', 'seed'),
  ('loom', 'Loom', 'Bills & Utilities', 'subscription', 'Loom', 'seed'),
  ('loom.com', 'Loom', 'Bills & Utilities', 'subscription', 'Loom', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CRYPTOCURRENCY EXCHANGES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('coinbase', 'Coinbase', 'Shopping', 'general', 'seed'),
  ('coinbase.com', 'Coinbase', 'Shopping', 'general', 'seed'),
  ('binance', 'Binance', 'Shopping', 'general', 'seed'),
  ('binance.com', 'Binance', 'Shopping', 'general', 'seed'),
  ('kraken', 'Kraken', 'Shopping', 'general', 'seed'),
  ('kraken.com', 'Kraken', 'Shopping', 'general', 'seed'),
  ('crypto.com', 'Crypto.com', 'Shopping', 'general', 'seed'),
  ('gemini', 'Gemini', 'Shopping', 'general', 'seed'),
  ('gemini.com', 'Gemini', 'Shopping', 'general', 'seed'),
  ('bitstamp', 'Bitstamp', 'Shopping', 'general', 'seed'),
  ('bitfinex', 'Bitfinex', 'Shopping', 'general', 'seed'),
  ('kucoin', 'KuCoin', 'Shopping', 'general', 'seed'),
  ('bybit', 'Bybit', 'Shopping', 'general', 'seed'),
  ('robinhood', 'Robinhood', 'Shopping', 'general', 'seed'),
  ('robinhood.com', 'Robinhood', 'Shopping', 'general', 'seed'),
  ('etoro', 'eToro', 'Shopping', 'general', 'seed'),
  ('etoro.com', 'eToro', 'Shopping', 'general', 'seed'),
  ('revolut trading', 'Revolut', 'Shopping', 'general', 'seed'),
  ('trading 212', 'Trading 212', 'Shopping', 'general', 'seed'),
  ('trading212', 'Trading 212', 'Shopping', 'general', 'seed'),
  ('freetrade', 'Freetrade', 'Shopping', 'general', 'seed'),
  ('interactive brokers', 'IBKR', 'Shopping', 'general', 'seed'),
  ('ibkr', 'IBKR', 'Shopping', 'general', 'seed'),
  ('charles schwab', 'Charles Schwab', 'Shopping', 'general', 'seed'),
  ('fidelity', 'Fidelity', 'Shopping', 'general', 'seed'),
  ('vanguard', 'Vanguard', 'Shopping', 'general', 'seed'),
  ('hargreaves lansdown', 'Hargreaves Lansdown', 'Shopping', 'general', 'seed'),
  ('hl.co.uk', 'Hargreaves Lansdown', 'Shopping', 'general', 'seed'),
  ('aj bell', 'AJ Bell', 'Shopping', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- FUEL / GAS STATIONS (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- UK (additional)
  ('esso', 'Esso', 'Transport', 'general', 'seed'),
  ('esso tesco', 'Esso', 'Transport', 'general', 'seed'),
  ('texaco', 'Texaco', 'Transport', 'general', 'seed'),
  ('murco', 'Murco', 'Transport', 'general', 'seed'),
  ('jet fuel', 'JET', 'Transport', 'general', 'seed'),
  ('jet petrol', 'JET', 'Transport', 'general', 'seed'),
  ('gulf petrol', 'Gulf', 'Transport', 'general', 'seed'),
  -- US
  ('chevron', 'Chevron', 'Transport', 'general', 'seed'),
  ('exxon', 'ExxonMobil', 'Transport', 'general', 'seed'),
  ('exxonmobil', 'ExxonMobil', 'Transport', 'general', 'seed'),
  ('mobil', 'ExxonMobil', 'Transport', 'general', 'seed'),
  ('shell oil', 'Shell', 'Transport', 'general', 'seed'),
  ('shell service station', 'Shell', 'Transport', 'general', 'seed'),
  ('costco gas', 'Costco Gas', 'Transport', 'general', 'seed'),
  ('costco fuel', 'Costco Gas', 'Transport', 'general', 'seed'),
  ('sam''s fuel', 'Sam''s Club', 'Transport', 'general', 'seed'),
  ('circle k', 'Circle K', 'Transport', 'general', 'seed'),
  ('wawa', 'Wawa', 'Transport', 'general', 'seed'),
  ('sheetz', 'Sheetz', 'Transport', 'general', 'seed'),
  ('quiktrip', 'QuikTrip', 'Transport', 'general', 'seed'),
  ('racetrac', 'RaceTrac', 'Transport', 'general', 'seed'),
  ('loves travel stop', 'Love''s', 'Transport', 'general', 'seed'),
  ('pilot flying j', 'Pilot', 'Transport', 'general', 'seed'),
  ('sunoco', 'Sunoco', 'Transport', 'general', 'seed'),
  ('marathon', 'Marathon', 'Transport', 'general', 'seed'),
  ('phillips 66', 'Phillips 66', 'Transport', 'general', 'seed'),
  ('valero', 'Valero', 'Transport', 'general', 'seed'),
  ('buc-ees', 'Buc-ee''s', 'Transport', 'general', 'seed'),
  ('buc-ee''s', 'Buc-ee''s', 'Transport', 'general', 'seed'),
  -- Global
  ('total energies', 'TotalEnergies', 'Transport', 'general', 'seed'),
  ('totalenergies', 'TotalEnergies', 'Transport', 'general', 'seed'),
  ('repsol', 'Repsol', 'Transport', 'general', 'seed'),
  ('caltex', 'Caltex', 'Transport', 'general', 'seed'),
  ('petronas', 'Petronas', 'Transport', 'general', 'seed'),
  ('indian oil', 'Indian Oil', 'Transport', 'general', 'seed'),
  ('adnoc', 'ADNOC', 'Transport', 'general', 'seed'),
  ('adnoc distribution', 'ADNOC', 'Transport', 'general', 'seed'),
  ('emarat', 'EMARAT', 'Transport', 'general', 'seed'),
  ('enoc', 'ENOC', 'Transport', 'general', 'seed'),
  -- EV Charging (global)
  ('chargepoint', 'ChargePoint', 'Transport', 'general', 'seed'),
  ('electrify america', 'Electrify America', 'Transport', 'general', 'seed'),
  ('evgo', 'EVgo', 'Transport', 'general', 'seed'),
  ('tesla supercharger', 'Tesla Supercharger', 'Transport', 'general', 'seed'),
  ('ionity', 'IONITY', 'Transport', 'general', 'seed'),
  ('gridserve', 'GRIDSERVE', 'Transport', 'general', 'seed'),
  ('osprey charging', 'Osprey', 'Transport', 'general', 'seed'),
  ('chargefox', 'Chargefox', 'Transport', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- PHARMACIES & HEALTH
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US
  ('cvs pharmacy', 'CVS', 'Health', 'retailer', 'seed'),
  ('cvs', 'CVS', 'Health', 'retailer', 'seed'),
  ('cvs.com', 'CVS', 'Health', 'retailer', 'seed'),
  ('walgreens', 'Walgreens', 'Health', 'retailer', 'seed'),
  ('walgreens.com', 'Walgreens', 'Health', 'retailer', 'seed'),
  ('rite aid', 'Rite Aid', 'Health', 'retailer', 'seed'),
  ('goodrx', 'GoodRx', 'Health', 'general', 'seed'),
  -- AU
  ('chemist warehouse', 'Chemist Warehouse', 'Health', 'retailer', 'seed'),
  ('priceline pharmacy', 'Priceline', 'Health', 'retailer', 'seed'),
  ('terry white', 'Terry White', 'Health', 'retailer', 'seed'),
  -- Europe
  ('dm drogerie', 'dm', 'Health', 'retailer', 'seed'),
  ('rossmann', 'Rossmann', 'Health', 'retailer', 'seed'),
  ('muller drogerie', 'Müller', 'Health', 'retailer', 'seed'),
  -- Middle East
  ('al nahdi pharmacy', 'Al Nahdi', 'Health', 'retailer', 'seed'),
  ('aster pharmacy', 'Aster', 'Health', 'retailer', 'seed'),
  ('life pharmacy', 'Life Pharmacy', 'Health', 'retailer', 'seed'),
  -- Telehealth
  ('teladoc', 'Teladoc', 'Health', 'general', 'seed'),
  ('teladoc.com', 'Teladoc', 'Health', 'general', 'seed'),
  ('babylon health', 'Babylon', 'Health', 'general', 'seed'),
  ('zocdoc', 'Zocdoc', 'Health', 'general', 'seed'),
  ('zocdoc.com', 'Zocdoc', 'Health', 'general', 'seed'),
  ('pushdoctor', 'Push Doctor', 'Health', 'general', 'seed'),
  -- Optical (global)
  ('visionexpress', 'Vision Express', 'Health', 'retailer', 'seed'),
  ('lenscrafters', 'LensCrafters', 'Health', 'retailer', 'seed'),
  ('warby parker', 'Warby Parker', 'Health', 'retailer', 'seed'),
  ('warbyparker.com', 'Warby Parker', 'Health', 'retailer', 'seed'),
  -- Dental
  ('mydentist', 'MyDentist', 'Health', 'general', 'seed'),
  ('aspen dental', 'Aspen Dental', 'Health', 'general', 'seed'),
  ('smile direct club', 'SmileDirectClub', 'Health', 'general', 'seed'),
  ('invisalign', 'Invisalign', 'Health', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CONVENIENCE STORES (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('wawa store', 'Wawa', 'Groceries', 'grocery', 'seed'),
  ('sheetz store', 'Sheetz', 'Groceries', 'grocery', 'seed'),
  ('casey''s general', 'Casey''s', 'Groceries', 'grocery', 'seed'),
  ('caseys', 'Casey''s', 'Groceries', 'grocery', 'seed'),
  ('kwik-e-mart', 'Kwik-E-Mart', 'Groceries', 'grocery', 'seed'),
  ('am pm', 'ampm', 'Groceries', 'grocery', 'seed'),
  ('Cumberland farms', 'Cumberland Farms', 'Groceries', 'grocery', 'seed'),
  ('quick stop', 'Quick Stop', 'Groceries', 'grocery', 'seed'),
  ('couche-tard', 'Couche-Tard', 'Groceries', 'grocery', 'seed'),
  ('ministop', 'Ministop', 'Groceries', 'grocery', 'seed'),
  -- Quick Commerce
  ('gopuff', 'Gopuff', 'Groceries', 'grocery', 'seed'),
  ('gopuff.com', 'Gopuff', 'Groceries', 'grocery', 'seed'),
  ('flink', 'Flink', 'Groceries', 'grocery', 'seed'),
  ('jiffy', 'Jiffy', 'Groceries', 'grocery', 'seed'),
  ('zapp', 'Zapp', 'Groceries', 'grocery', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- COWORKING & OFFICE
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('wework', 'WeWork', 'Bills & Utilities', 'subscription', 'WeWork', 'seed'),
  ('wework.com', 'WeWork', 'Bills & Utilities', 'subscription', 'WeWork', 'seed'),
  ('regus', 'Regus', 'Bills & Utilities', 'subscription', 'Regus', 'seed'),
  ('iwg', 'IWG', 'Bills & Utilities', 'subscription', 'IWG', 'seed'),
  ('spaces', 'Spaces', 'Bills & Utilities', 'subscription', 'Spaces', 'seed'),
  ('industrious', 'Industrious', 'Bills & Utilities', 'subscription', 'Industrious', 'seed')
ON CONFLICT (alias) DO NOTHING;

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Office Supplies
  ('staples', 'Staples', 'Shopping', 'retailer', 'seed'),
  ('staples.com', 'Staples', 'Shopping', 'retailer', 'seed'),
  ('office depot', 'Office Depot', 'Shopping', 'retailer', 'seed'),
  ('officedepot.com', 'Office Depot', 'Shopping', 'retailer', 'seed'),
  ('viking direct', 'Viking', 'Shopping', 'retailer', 'seed'),
  ('ryman', 'Ryman', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- AUTOMOTIVE (services, parts, car washes)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US Auto Parts
  ('autozone', 'AutoZone', 'Transport', 'retailer', 'seed'),
  ('autozone.com', 'AutoZone', 'Transport', 'retailer', 'seed'),
  ('o''reilly auto', 'O''Reilly Auto Parts', 'Transport', 'retailer', 'seed'),
  ('oreilly auto', 'O''Reilly Auto Parts', 'Transport', 'retailer', 'seed'),
  ('advance auto parts', 'Advance Auto Parts', 'Transport', 'retailer', 'seed'),
  ('napa auto parts', 'NAPA', 'Transport', 'retailer', 'seed'),
  -- Car Washes
  ('imowash', 'IMO Car Wash', 'Transport', 'general', 'seed'),
  ('imo car wash', 'IMO Car Wash', 'Transport', 'general', 'seed'),
  ('mister car wash', 'Mister Car Wash', 'Transport', 'general', 'seed'),
  -- Tyre / Service
  ('firestone', 'Firestone', 'Transport', 'general', 'seed'),
  ('goodyear', 'Goodyear', 'Transport', 'general', 'seed'),
  ('jiffy lube', 'Jiffy Lube', 'Transport', 'general', 'seed'),
  ('pep boys', 'Pep Boys', 'Transport', 'general', 'seed'),
  ('valvoline', 'Valvoline', 'Transport', 'general', 'seed'),
  ('midas', 'Midas', 'Transport', 'general', 'seed'),
  ('eurocar parts', 'Euro Car Parts', 'Transport', 'retailer', 'seed'),
  -- Tolls (global)
  ('e-zpass', 'E-ZPass', 'Transport', 'transport', 'seed'),
  ('ezpass', 'E-ZPass', 'Transport', 'transport', 'seed'),
  ('sunpass', 'SunPass', 'Transport', 'transport', 'seed'),
  ('fastrak', 'FasTrak', 'Transport', 'transport', 'seed'),
  ('peach pass', 'Peach Pass', 'Transport', 'transport', 'seed'),
  ('linkt', 'Linkt', 'Transport', 'transport', 'seed'),
  ('etoll', 'eToll', 'Transport', 'transport', 'seed'),
  ('dart charge', 'Dart Charge', 'Transport', 'transport', 'seed'),
  ('congestion charge', 'Congestion Charge', 'Transport', 'transport', 'seed'),
  ('ulez', 'ULEZ', 'Transport', 'transport', 'seed'),
  ('clean air zone', 'Clean Air Zone', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- TAX / GOVERNMENT / ACCOUNTING
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US
  ('turbotax', 'TurboTax', 'Bills & Utilities', 'general', 'seed'),
  ('turbotax.com', 'TurboTax', 'Bills & Utilities', 'general', 'seed'),
  ('h&r block', 'H&R Block', 'Bills & Utilities', 'general', 'seed'),
  ('hrblock', 'H&R Block', 'Bills & Utilities', 'general', 'seed'),
  ('irs', 'IRS', 'Bills & Utilities', 'general', 'seed'),
  ('irs.gov', 'IRS', 'Bills & Utilities', 'general', 'seed'),
  ('eftps', 'IRS', 'Bills & Utilities', 'general', 'seed'),
  -- UK
  ('hmrc', 'HMRC', 'Bills & Utilities', 'general', 'seed'),
  ('gov.uk', 'GOV.UK', 'Bills & Utilities', 'general', 'seed'),
  -- AU
  ('ato', 'ATO', 'Bills & Utilities', 'general', 'seed'),
  ('australian taxation', 'ATO', 'Bills & Utilities', 'general', 'seed'),
  -- Accounting Software
  ('quickbooks', 'QuickBooks', 'Bills & Utilities', 'subscription', 'seed'),
  ('quickbooks.com', 'QuickBooks', 'Bills & Utilities', 'subscription', 'seed'),
  ('xero', 'Xero', 'Bills & Utilities', 'subscription', 'seed'),
  ('xero.com', 'Xero', 'Bills & Utilities', 'subscription', 'seed'),
  ('freshbooks', 'FreshBooks', 'Bills & Utilities', 'subscription', 'seed'),
  ('freshbooks.com', 'FreshBooks', 'Bills & Utilities', 'subscription', 'seed'),
  ('sage', 'Sage', 'Bills & Utilities', 'subscription', 'seed'),
  ('sage.com', 'Sage', 'Bills & Utilities', 'subscription', 'seed'),
  ('wave', 'Wave', 'Bills & Utilities', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- OUTDOOR / SPORTING GOODS (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('rei', 'REI', 'Shopping', 'retailer', 'seed'),
  ('rei.com', 'REI', 'Shopping', 'retailer', 'seed'),
  ('bass pro shops', 'Bass Pro Shops', 'Shopping', 'retailer', 'seed'),
  ('cabelas', 'Cabela''s', 'Shopping', 'retailer', 'seed'),
  ('cabela''s', 'Cabela''s', 'Shopping', 'retailer', 'seed'),
  ('decathlon', 'Decathlon', 'Shopping', 'retailer', 'seed'),
  ('decathlon.com', 'Decathlon', 'Shopping', 'retailer', 'seed'),
  ('go outdoors', 'Go Outdoors', 'Shopping', 'retailer', 'seed'),
  ('cotswold outdoor', 'Cotswold Outdoor', 'Shopping', 'retailer', 'seed'),
  ('millets', 'Millets', 'Shopping', 'retailer', 'seed'),
  ('mountain warehouse', 'Mountain Warehouse', 'Shopping', 'retailer', 'seed'),
  ('anaconda', 'Anaconda', 'Shopping', 'retailer', 'seed'),
  ('rebel sport', 'Rebel Sport', 'Shopping', 'retailer', 'seed'),
  ('dicks sporting goods', 'DICK''S Sporting Goods', 'Shopping', 'retailer', 'seed'),
  ('dick''s sporting goods', 'DICK''S Sporting Goods', 'Shopping', 'retailer', 'seed'),
  ('academy sports', 'Academy Sports', 'Shopping', 'retailer', 'seed'),
  ('intersport', 'Intersport', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- LUXURY BRANDS (extended)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('dior', 'Dior', 'Shopping', 'retailer', 'seed'),
  ('fendi', 'Fendi', 'Shopping', 'retailer', 'seed'),
  ('balenciaga', 'Balenciaga', 'Shopping', 'retailer', 'seed'),
  ('givenchy', 'Givenchy', 'Shopping', 'retailer', 'seed'),
  ('bottega veneta', 'Bottega Veneta', 'Shopping', 'retailer', 'seed'),
  ('saint laurent', 'Saint Laurent', 'Shopping', 'retailer', 'seed'),
  ('versace', 'Versace', 'Shopping', 'retailer', 'seed'),
  ('valentino', 'Valentino', 'Shopping', 'retailer', 'seed'),
  ('alexander mcqueen', 'Alexander McQueen', 'Shopping', 'retailer', 'seed'),
  ('moncler', 'Moncler', 'Shopping', 'retailer', 'seed'),
  ('cartier', 'Cartier', 'Shopping', 'retailer', 'seed'),
  ('tiffany & co', 'Tiffany & Co.', 'Shopping', 'retailer', 'seed'),
  ('tiffany and co', 'Tiffany & Co.', 'Shopping', 'retailer', 'seed'),
  ('pandora', 'Pandora Jewellery', 'Shopping', 'retailer', 'seed'),
  ('rolex', 'Rolex', 'Shopping', 'retailer', 'seed'),
  ('omega', 'Omega', 'Shopping', 'retailer', 'seed'),
  ('tag heuer', 'TAG Heuer', 'Shopping', 'retailer', 'seed'),
  ('net-a-porter', 'Net-a-Porter', 'Shopping', 'retailer', 'seed'),
  ('net-a-porter.com', 'Net-a-Porter', 'Shopping', 'retailer', 'seed'),
  ('farfetch', 'Farfetch', 'Shopping', 'retailer', 'seed'),
  ('farfetch.com', 'Farfetch', 'Shopping', 'retailer', 'seed'),
  ('mr porter', 'Mr Porter', 'Shopping', 'retailer', 'seed'),
  ('matches fashion', 'MATCHESFASHION', 'Shopping', 'retailer', 'seed'),
  ('ssense', 'SSENSE', 'Shopping', 'retailer', 'seed'),
  ('ssense.com', 'SSENSE', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- HOME SERVICES & MOVING
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Gig / Marketplace
  ('taskrabbit', 'TaskRabbit', 'Bills & Utilities', 'general', 'seed'),
  ('taskrabbit.com', 'TaskRabbit', 'Bills & Utilities', 'general', 'seed'),
  ('thumbtack', 'Thumbtack', 'Bills & Utilities', 'general', 'seed'),
  ('angi', 'Angi', 'Bills & Utilities', 'general', 'seed'),
  ('angi.com', 'Angi', 'Bills & Utilities', 'general', 'seed'),
  ('checkatrade', 'Checkatrade', 'Bills & Utilities', 'general', 'seed'),
  ('rated people', 'Rated People', 'Bills & Utilities', 'general', 'seed'),
  ('bark.com', 'Bark', 'Bills & Utilities', 'general', 'seed'),
  ('airtasker', 'Airtasker', 'Bills & Utilities', 'general', 'seed'),
  ('hipages', 'hipages', 'Bills & Utilities', 'general', 'seed'),
  -- Moving & Storage
  ('u-haul', 'U-Haul', 'Bills & Utilities', 'general', 'seed'),
  ('uhaul', 'U-Haul', 'Bills & Utilities', 'general', 'seed'),
  ('penske truck', 'Penske', 'Bills & Utilities', 'general', 'seed'),
  ('pods', 'PODS', 'Bills & Utilities', 'general', 'seed'),
  ('public storage', 'Public Storage', 'Bills & Utilities', 'general', 'seed'),
  ('extra space storage', 'Extra Space', 'Bills & Utilities', 'general', 'seed'),
  ('big yellow storage', 'Big Yellow', 'Bills & Utilities', 'general', 'seed'),
  ('safestore', 'Safestore', 'Bills & Utilities', 'general', 'seed'),
  -- Cleaning
  ('molly maid', 'Molly Maid', 'Bills & Utilities', 'general', 'seed'),
  ('merry maids', 'Merry Maids', 'Bills & Utilities', 'general', 'seed'),
  ('hassle.com', 'Hassle.com', 'Bills & Utilities', 'general', 'seed'),
  ('housekeep', 'Housekeep', 'Bills & Utilities', 'general', 'seed'),
  -- Laundry
  ('johnson cleaners', 'Johnson Cleaners', 'Bills & Utilities', 'general', 'seed'),
  ('timpson', 'Timpson', 'Bills & Utilities', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CHILDCARE & BABY
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('mothercare', 'Mothercare', 'Shopping', 'retailer', 'seed'),
  ('mothercare.com', 'Mothercare', 'Shopping', 'retailer', 'seed'),
  ('mamas & papas', 'Mamas & Papas', 'Shopping', 'retailer', 'seed'),
  ('jojo maman bebe', 'JoJo Maman Bébé', 'Shopping', 'retailer', 'seed'),
  ('the white company', 'The White Company', 'Shopping', 'retailer', 'seed'),
  ('baby bunting', 'Baby Bunting', 'Shopping', 'retailer', 'seed'),
  ('buy buy baby', 'buybuy BABY', 'Shopping', 'retailer', 'seed'),
  ('carter''s', 'Carter''s', 'Shopping', 'retailer', 'seed'),
  ('carters', 'Carter''s', 'Shopping', 'retailer', 'seed'),
  ('bright horizons', 'Bright Horizons', 'Childcare', 'general', 'seed'),
  ('kidsunlimited', 'Kids Unlimited', 'Childcare', 'general', 'seed'),
  ('busy bees nursery', 'Busy Bees', 'Childcare', 'general', 'seed'),
  ('kindercare', 'KinderCare', 'Childcare', 'general', 'seed'),
  ('goddard school', 'The Goddard School', 'Childcare', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- PET CARE
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('vets4pets', 'Vets4Pets', 'Shopping', 'general', 'seed'),
  ('medivet', 'Medivet', 'Shopping', 'general', 'seed'),
  ('banfield', 'Banfield', 'Shopping', 'general', 'seed'),
  ('vca animal hospital', 'VCA', 'Shopping', 'general', 'seed'),
  ('greencross vets', 'Greencross', 'Shopping', 'general', 'seed'),
  ('rover.com', 'Rover', 'Shopping', 'general', 'seed'),
  ('rover', 'Rover', 'Shopping', 'general', 'seed'),
  ('wag walking', 'Wag!', 'Shopping', 'general', 'seed'),
  ('barkbox', 'BarkBox', 'Shopping', 'general', 'seed'),
  ('tails.com', 'Tails.com', 'Shopping', 'general', 'seed'),
  ('butternut box', 'Butternut Box', 'Shopping', 'general', 'seed'),
  -- Pet Insurance
  ('petplan', 'Petplan', 'Insurance', 'subscription', 'seed'),
  ('bought by many', 'ManyPets', 'Insurance', 'subscription', 'seed'),
  ('manypets', 'ManyPets', 'Insurance', 'subscription', 'seed'),
  ('trupanion', 'Trupanion', 'Insurance', 'subscription', 'seed'),
  ('healthy paws', 'Healthy Paws', 'Insurance', 'subscription', 'seed'),
  ('fetch pet', 'Fetch', 'Insurance', 'subscription', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- ALCOHOL & DRINKS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- UK
  ('majestic wine', 'Majestic Wine', 'Groceries', 'retailer', 'seed'),
  ('majestic.co.uk', 'Majestic Wine', 'Groceries', 'retailer', 'seed'),
  ('laithwaites', 'Laithwaites', 'Groceries', 'retailer', 'seed'),
  ('virgin wines', 'Virgin Wines', 'Groceries', 'retailer', 'seed'),
  ('naked wines', 'Naked Wines', 'Groceries', 'retailer', 'seed'),
  ('nakedwines.com', 'Naked Wines', 'Groceries', 'retailer', 'seed'),
  ('beer52', 'Beer52', 'Groceries', 'retailer', 'seed'),
  -- US
  ('total wine', 'Total Wine', 'Groceries', 'retailer', 'seed'),
  ('bevmo', 'BevMo', 'Groceries', 'retailer', 'seed'),
  ('drizly', 'Drizly', 'Groceries', 'retailer', 'seed'),
  ('drizly.com', 'Drizly', 'Groceries', 'retailer', 'seed'),
  -- AU
  ('dan murphys', 'Dan Murphy''s', 'Groceries', 'retailer', 'seed'),
  ('dan murphy''s', 'Dan Murphy''s', 'Groceries', 'retailer', 'seed'),
  ('bws', 'BWS', 'Groceries', 'retailer', 'seed'),
  ('liquorland', 'Liquorland', 'Groceries', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- PRINTING / PHOTOS / PERSONALISATION
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('shutterfly', 'Shutterfly', 'Shopping', 'retailer', 'seed'),
  ('shutterfly.com', 'Shutterfly', 'Shopping', 'retailer', 'seed'),
  ('snapfish', 'Snapfish', 'Shopping', 'retailer', 'seed'),
  ('vistaprint', 'Vistaprint', 'Shopping', 'retailer', 'seed'),
  ('vistaprint.com', 'Vistaprint', 'Shopping', 'retailer', 'seed'),
  ('photobox', 'Photobox', 'Shopping', 'retailer', 'seed'),
  ('cewe', 'CEWE', 'Shopping', 'retailer', 'seed'),
  ('mixbook', 'Mixbook', 'Shopping', 'retailer', 'seed'),
  ('minted', 'Minted', 'Shopping', 'retailer', 'seed'),
  ('minted.com', 'Minted', 'Shopping', 'retailer', 'seed'),
  ('canva print', 'Canva', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- REAL ESTATE / PROPERTY
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Property Portals
  ('rightmove', 'Rightmove', 'Bills & Utilities', 'general', 'seed'),
  ('rightmove.co.uk', 'Rightmove', 'Bills & Utilities', 'general', 'seed'),
  ('zoopla', 'Zoopla', 'Bills & Utilities', 'general', 'seed'),
  ('zoopla.co.uk', 'Zoopla', 'Bills & Utilities', 'general', 'seed'),
  ('zillow', 'Zillow', 'Bills & Utilities', 'general', 'seed'),
  ('zillow.com', 'Zillow', 'Bills & Utilities', 'general', 'seed'),
  ('redfin', 'Redfin', 'Bills & Utilities', 'general', 'seed'),
  ('redfin.com', 'Redfin', 'Bills & Utilities', 'general', 'seed'),
  ('realtor.com', 'Realtor.com', 'Bills & Utilities', 'general', 'seed'),
  ('domain.com.au', 'Domain', 'Bills & Utilities', 'general', 'seed'),
  ('realestate.com.au', 'REA Group', 'Bills & Utilities', 'general', 'seed'),
  -- Rent / Letting
  ('openrent', 'OpenRent', 'Bills & Utilities', 'general', 'seed'),
  ('spare room', 'SpareRoom', 'Bills & Utilities', 'general', 'seed'),
  ('apartments.com', 'Apartments.com', 'Bills & Utilities', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- ELECTRONICS / TECH RETAIL (extended)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('micro center', 'Micro Center', 'Shopping', 'retailer', 'seed'),
  ('newegg', 'Newegg', 'Shopping', 'retailer', 'seed'),
  ('newegg.com', 'Newegg', 'Shopping', 'retailer', 'seed'),
  ('b&h photo', 'B&H Photo', 'Shopping', 'retailer', 'seed'),
  ('bhphoto.com', 'B&H Photo', 'Shopping', 'retailer', 'seed'),
  ('adorama', 'Adorama', 'Shopping', 'retailer', 'seed'),
  ('harvey norman', 'Harvey Norman', 'Shopping', 'retailer', 'seed'),
  ('the good guys', 'The Good Guys', 'Shopping', 'retailer', 'seed'),
  ('mediamarkt', 'MediaMarkt', 'Shopping', 'retailer', 'seed'),
  ('saturn', 'Saturn', 'Shopping', 'retailer', 'seed'),
  ('fnac', 'Fnac', 'Shopping', 'retailer', 'seed'),
  ('jaycar', 'Jaycar', 'Shopping', 'retailer', 'seed'),
  ('cex', 'CeX', 'Shopping', 'retailer', 'seed'),
  ('scan.co.uk', 'Scan', 'Shopping', 'retailer', 'seed'),
  ('overclockers', 'Overclockers', 'Shopping', 'retailer', 'seed'),
  ('ebuyer', 'Ebuyer', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- FAST FASHION / ONLINE-ONLY FASHION (extended)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('boohoo', 'Boohoo', 'Shopping', 'retailer', 'seed'),
  ('boohoo.com', 'Boohoo', 'Shopping', 'retailer', 'seed'),
  ('prettylittlething', 'PrettyLittleThing', 'Shopping', 'retailer', 'seed'),
  ('plt', 'PrettyLittleThing', 'Shopping', 'retailer', 'seed'),
  ('missguided', 'Missguided', 'Shopping', 'retailer', 'seed'),
  ('fashion nova', 'Fashion Nova', 'Shopping', 'retailer', 'seed'),
  ('fashionnova.com', 'Fashion Nova', 'Shopping', 'retailer', 'seed'),
  ('gymshark', 'Gymshark', 'Shopping', 'retailer', 'seed'),
  ('gymshark.com', 'Gymshark', 'Shopping', 'retailer', 'seed'),
  ('oh polly', 'Oh Polly', 'Shopping', 'retailer', 'seed'),
  ('white fox', 'White Fox', 'Shopping', 'retailer', 'seed'),
  ('princess polly', 'Princess Polly', 'Shopping', 'retailer', 'seed'),
  ('revolve', 'Revolve', 'Shopping', 'retailer', 'seed'),
  ('revolve.com', 'Revolve', 'Shopping', 'retailer', 'seed'),
  ('showpo', 'Showpo', 'Shopping', 'retailer', 'seed'),
  ('cider', 'Cider', 'Shopping', 'retailer', 'seed'),
  ('halara', 'Halara', 'Shopping', 'retailer', 'seed'),
  ('mango', 'Mango', 'Shopping', 'retailer', 'seed'),
  ('bershka', 'Bershka', 'Shopping', 'retailer', 'seed'),
  ('pull & bear', 'Pull & Bear', 'Shopping', 'retailer', 'seed'),
  ('stradivarius', 'Stradivarius', 'Shopping', 'retailer', 'seed'),
  ('massimo dutti', 'Massimo Dutti', 'Shopping', 'retailer', 'seed'),
  ('cos', 'COS', 'Shopping', 'retailer', 'seed'),
  ('arket', 'ARKET', 'Shopping', 'retailer', 'seed'),
  ('& other stories', '& Other Stories', 'Shopping', 'retailer', 'seed'),
  ('weekday', 'Weekday', 'Shopping', 'retailer', 'seed'),
  ('monki', 'Monki', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- HOME & GARDEN (extended worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('west elm', 'West Elm', 'Shopping', 'retailer', 'seed'),
  ('cb2', 'CB2', 'Shopping', 'retailer', 'seed'),
  ('crate & barrel', 'Crate & Barrel', 'Shopping', 'retailer', 'seed'),
  ('crate and barrel', 'Crate & Barrel', 'Shopping', 'retailer', 'seed'),
  ('pier 1', 'Pier 1', 'Shopping', 'retailer', 'seed'),
  ('article', 'Article', 'Shopping', 'retailer', 'seed'),
  ('article.com', 'Article', 'Shopping', 'retailer', 'seed'),
  ('castlery', 'Castlery', 'Shopping', 'retailer', 'seed'),
  ('habitat', 'Habitat', 'Shopping', 'retailer', 'seed'),
  ('dfs', 'DFS', 'Shopping', 'retailer', 'seed'),
  ('sofology', 'Sofology', 'Shopping', 'retailer', 'seed'),
  ('oak furnitureland', 'Oak Furnitureland', 'Shopping', 'retailer', 'seed'),
  ('made.com', 'MADE', 'Shopping', 'retailer', 'seed'),
  ('the range', 'The Range', 'Shopping', 'retailer', 'seed'),
  ('wilko', 'Wilko', 'Shopping', 'retailer', 'seed'),
  ('robert dyas', 'Robert Dyas', 'Shopping', 'retailer', 'seed'),
  ('toolstation', 'Toolstation', 'Shopping', 'retailer', 'seed'),
  ('bunnings.com.au', 'Bunnings', 'Shopping', 'retailer', 'seed'),
  ('menards', 'Menards', 'Shopping', 'retailer', 'seed'),
  ('ace hardware', 'Ace Hardware', 'Shopping', 'retailer', 'seed'),
  ('harbor freight', 'Harbor Freight', 'Shopping', 'retailer', 'seed'),
  ('leroy merlin', 'Leroy Merlin', 'Shopping', 'retailer', 'seed'),
  ('obi', 'OBI', 'Shopping', 'retailer', 'seed'),
  ('hornbach', 'Hornbach', 'Shopping', 'retailer', 'seed'),
  ('bauhaus', 'Bauhaus', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- BEAUTY & PERSONAL CARE (extended)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('the body shop', 'The Body Shop', 'Shopping', 'retailer', 'seed'),
  ('l''occitane', 'L''Occitane', 'Shopping', 'retailer', 'seed'),
  ('kiehl''s', 'Kiehl''s', 'Shopping', 'retailer', 'seed'),
  ('mac cosmetics', 'MAC', 'Shopping', 'retailer', 'seed'),
  ('nyx cosmetics', 'NYX', 'Shopping', 'retailer', 'seed'),
  ('charlotte tilbury', 'Charlotte Tilbury', 'Shopping', 'retailer', 'seed'),
  ('glossier', 'Glossier', 'Shopping', 'retailer', 'seed'),
  ('glossier.com', 'Glossier', 'Shopping', 'retailer', 'seed'),
  ('the ordinary', 'The Ordinary', 'Shopping', 'retailer', 'seed'),
  ('cult beauty', 'Cult Beauty', 'Shopping', 'retailer', 'seed'),
  ('cultbeauty.co.uk', 'Cult Beauty', 'Shopping', 'retailer', 'seed'),
  ('lookfantastic', 'Lookfantastic', 'Shopping', 'retailer', 'seed'),
  ('lookfantastic.com', 'Lookfantastic', 'Shopping', 'retailer', 'seed'),
  ('birchbox', 'Birchbox', 'Shopping', 'retailer', 'seed'),
  ('dollar shave club', 'Dollar Shave Club', 'Shopping', 'retailer', 'seed'),
  ('harrys.com', 'Harry''s', 'Shopping', 'retailer', 'seed'),
  ('harry''s', 'Harry''s', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- BOOK STORES & MEDIA (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('barnes & noble', 'Barnes & Noble', 'Shopping', 'retailer', 'seed'),
  ('barnesandnoble.com', 'Barnes & Noble', 'Shopping', 'retailer', 'seed'),
  ('thriftbooks', 'ThriftBooks', 'Shopping', 'retailer', 'seed'),
  ('thriftbooks.com', 'ThriftBooks', 'Shopping', 'retailer', 'seed'),
  ('bookshop.org', 'Bookshop.org', 'Shopping', 'retailer', 'seed'),
  ('foyles', 'Foyles', 'Shopping', 'retailer', 'seed'),
  ('blackwells', 'Blackwell''s', 'Shopping', 'retailer', 'seed'),
  ('dymocks', 'Dymocks', 'Shopping', 'retailer', 'seed'),
  ('booktopia', 'Booktopia', 'Shopping', 'retailer', 'seed'),
  ('hmv', 'HMV', 'Shopping', 'retailer', 'seed'),
  ('rough trade', 'Rough Trade', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- MEAL KITS & FOOD BOXES (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('blue apron', 'Blue Apron', 'Groceries', 'subscription', 'Blue Apron', 'seed'),
  ('home chef', 'Home Chef', 'Groceries', 'subscription', 'Home Chef', 'seed'),
  ('sunbasket', 'Sun Basket', 'Groceries', 'subscription', 'Sun Basket', 'seed'),
  ('factor', 'Factor', 'Groceries', 'subscription', 'Factor', 'seed'),
  ('factor75', 'Factor', 'Groceries', 'subscription', 'Factor', 'seed'),
  ('daily harvest', 'Daily Harvest', 'Groceries', 'subscription', 'Daily Harvest', 'seed'),
  ('freshly', 'Freshly', 'Groceries', 'subscription', 'Freshly', 'seed'),
  ('mindful chef', 'Mindful Chef', 'Groceries', 'subscription', 'Mindful Chef', 'seed'),
  ('mindfulchef.com', 'Mindful Chef', 'Groceries', 'subscription', 'Mindful Chef', 'seed'),
  ('riverford', 'Riverford', 'Groceries', 'subscription', 'Riverford', 'seed'),
  ('oddbox', 'Oddbox', 'Groceries', 'subscription', 'Oddbox', 'seed'),
  ('allplants', 'allplants', 'Groceries', 'subscription', 'allplants', 'seed'),
  ('marleyspoon', 'Marley Spoon', 'Groceries', 'subscription', 'Marley Spoon', 'seed'),
  ('everyplate', 'EveryPlate', 'Groceries', 'subscription', 'EveryPlate', 'seed'),
  ('dinnerly', 'Dinnerly', 'Groceries', 'subscription', 'Dinnerly', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- GYMS & FITNESS (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- US
  ('planet fitness', 'Planet Fitness', 'Health', 'subscription', 'Planet Fitness', 'seed'),
  ('equinox', 'Equinox', 'Health', 'subscription', 'Equinox', 'seed'),
  ('la fitness', 'LA Fitness', 'Health', 'subscription', 'LA Fitness', 'seed'),
  ('24 hour fitness', '24 Hour Fitness', 'Health', 'subscription', '24 Hour Fitness', 'seed'),
  ('gold''s gym', 'Gold''s Gym', 'Health', 'subscription', 'Gold''s Gym', 'seed'),
  ('golds gym', 'Gold''s Gym', 'Health', 'subscription', 'Gold''s Gym', 'seed'),
  ('orangetheory', 'Orangetheory', 'Health', 'subscription', 'Orangetheory', 'seed'),
  ('orange theory fitness', 'Orangetheory', 'Health', 'subscription', 'Orangetheory', 'seed'),
  ('barry''s bootcamp', 'Barry''s', 'Health', 'subscription', 'Barry''s', 'seed'),
  ('barrys', 'Barry''s', 'Health', 'subscription', 'Barry''s', 'seed'),
  ('soulcycle', 'SoulCycle', 'Health', 'subscription', 'SoulCycle', 'seed'),
  ('f45 training', 'F45', 'Health', 'subscription', 'F45', 'seed'),
  ('f45', 'F45', 'Health', 'subscription', 'F45', 'seed'),
  ('crossfit', 'CrossFit', 'Health', 'subscription', 'CrossFit', 'seed'),
  ('ymca', 'YMCA', 'Health', 'subscription', 'YMCA', 'seed'),
  ('crunch fitness', 'Crunch Fitness', 'Health', 'subscription', 'Crunch Fitness', 'seed'),
  ('lifetime fitness', 'Life Time', 'Health', 'subscription', 'Life Time', 'seed'),
  ('life time fitness', 'Life Time', 'Health', 'subscription', 'Life Time', 'seed'),
  ('classpass', 'ClassPass', 'Health', 'subscription', 'ClassPass', 'seed'),
  ('classpass.com', 'ClassPass', 'Health', 'subscription', 'ClassPass', 'seed'),
  -- UK
  ('puregym', 'PureGym', 'Health', 'subscription', 'PureGym', 'seed'),
  ('the gym group', 'The Gym Group', 'Health', 'subscription', 'The Gym Group', 'seed'),
  ('david lloyd', 'David Lloyd', 'Health', 'subscription', 'David Lloyd', 'seed'),
  ('david lloyd leisure', 'David Lloyd', 'Health', 'subscription', 'David Lloyd', 'seed'),
  ('virgin active', 'Virgin Active', 'Health', 'subscription', 'Virgin Active', 'seed'),
  ('nuffield health', 'Nuffield Health', 'Health', 'subscription', 'Nuffield Health', 'seed'),
  ('bannatyne', 'Bannatyne', 'Health', 'subscription', 'Bannatyne', 'seed'),
  ('everyone active', 'Everyone Active', 'Health', 'subscription', 'Everyone Active', 'seed'),
  ('better gym', 'Better', 'Health', 'subscription', 'Better', 'seed'),
  ('gll', 'Better', 'Health', 'subscription', 'Better', 'seed'),
  -- AU/NZ
  ('anytime fitness', 'Anytime Fitness', 'Health', 'subscription', 'Anytime Fitness', 'seed'),
  ('snap fitness', 'Snap Fitness', 'Health', 'subscription', 'Snap Fitness', 'seed'),
  ('fitness first', 'Fitness First', 'Health', 'subscription', 'Fitness First', 'seed'),
  ('goodlife health clubs', 'Goodlife', 'Health', 'subscription', 'Goodlife', 'seed'),
  ('les mills', 'Les Mills', 'Health', 'subscription', 'Les Mills', 'seed'),
  -- Home Fitness
  ('peloton', 'Peloton', 'Health', 'subscription', 'Peloton', 'seed'),
  ('peloton digital', 'Peloton', 'Health', 'subscription', 'Peloton', 'seed'),
  ('onepeloton.com', 'Peloton', 'Health', 'subscription', 'Peloton', 'seed'),
  ('mirror fitness', 'Mirror', 'Health', 'subscription', 'Mirror', 'seed'),
  ('tonal', 'Tonal', 'Health', 'subscription', 'Tonal', 'seed'),
  ('apple fitness+', 'Apple Fitness+', 'Health', 'subscription', 'Apple Fitness+', 'seed'),
  ('apple fitness', 'Apple Fitness+', 'Health', 'subscription', 'Apple Fitness+', 'seed'),
  ('strava', 'Strava', 'Health', 'subscription', 'Strava', 'seed'),
  ('strava.com', 'Strava', 'Health', 'subscription', 'Strava', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- PARKING
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Apps
  ('justpark', 'JustPark', 'Transport', 'general', 'seed'),
  ('justpark.com', 'JustPark', 'Transport', 'general', 'seed'),
  ('ringo', 'RingGo', 'Transport', 'general', 'seed'),
  ('ringgo', 'RingGo', 'Transport', 'general', 'seed'),
  ('paybyphone', 'PayByPhone', 'Transport', 'general', 'seed'),
  ('easypark', 'EasyPark', 'Transport', 'general', 'seed'),
  ('parkmobile', 'ParkMobile', 'Transport', 'general', 'seed'),
  ('spothero', 'SpotHero', 'Transport', 'general', 'seed'),
  ('parkwhiz', 'ParkWhiz', 'Transport', 'general', 'seed'),
  -- Operators
  ('ncp', 'NCP', 'Transport', 'general', 'seed'),
  ('ncp car park', 'NCP', 'Transport', 'general', 'seed'),
  ('apcoa', 'APCOA', 'Transport', 'general', 'seed'),
  ('q-park', 'Q-Park', 'Transport', 'general', 'seed'),
  ('indigo parking', 'Indigo', 'Transport', 'general', 'seed'),
  ('europarks', 'Europarks', 'Transport', 'general', 'seed'),
  ('laz parking', 'LAZ Parking', 'Transport', 'general', 'seed'),
  ('sp+', 'SP+', 'Transport', 'general', 'seed'),
  ('wilson parking', 'Wilson Parking', 'Transport', 'general', 'seed'),
  ('secure parking', 'Secure Parking', 'Transport', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CINEMAS & THEATRES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US
  ('amc theatres', 'AMC', 'Entertainment', 'general', 'seed'),
  ('amc theaters', 'AMC', 'Entertainment', 'general', 'seed'),
  ('amc', 'AMC', 'Entertainment', 'general', 'seed'),
  ('regal cinemas', 'Regal', 'Entertainment', 'general', 'seed'),
  ('regal theaters', 'Regal', 'Entertainment', 'general', 'seed'),
  ('cinemark', 'Cinemark', 'Entertainment', 'general', 'seed'),
  ('cinemark theatres', 'Cinemark', 'Entertainment', 'general', 'seed'),
  ('alamo drafthouse', 'Alamo Drafthouse', 'Entertainment', 'general', 'seed'),
  -- UK
  ('odeon', 'Odeon', 'Entertainment', 'general', 'seed'),
  ('odeon cinema', 'Odeon', 'Entertainment', 'general', 'seed'),
  ('cineworld', 'Cineworld', 'Entertainment', 'general', 'seed'),
  ('vue cinema', 'Vue', 'Entertainment', 'general', 'seed'),
  ('vue cinemas', 'Vue', 'Entertainment', 'general', 'seed'),
  ('showcase cinema', 'Showcase', 'Entertainment', 'general', 'seed'),
  ('curzon', 'Curzon', 'Entertainment', 'general', 'seed'),
  ('picturehouse', 'Picturehouse', 'Entertainment', 'general', 'seed'),
  ('everyman cinema', 'Everyman', 'Entertainment', 'general', 'seed'),
  -- AU/NZ
  ('hoyts', 'Hoyts', 'Entertainment', 'general', 'seed'),
  ('event cinemas', 'Event Cinemas', 'Entertainment', 'general', 'seed'),
  ('village cinemas', 'Village Cinemas', 'Entertainment', 'general', 'seed'),
  ('reading cinemas', 'Reading Cinemas', 'Entertainment', 'general', 'seed'),
  -- Europe
  ('pathe', 'Pathé', 'Entertainment', 'general', 'seed'),
  ('ugc', 'UGC', 'Entertainment', 'general', 'seed'),
  ('kinepolis', 'Kinepolis', 'Entertainment', 'general', 'seed'),
  -- IMAX
  ('imax', 'IMAX', 'Entertainment', 'general', 'seed'),
  -- Theatre (UK/US)
  ('atg tickets', 'ATG', 'Entertainment', 'general', 'seed'),
  ('london theatre direct', 'London Theatre Direct', 'Entertainment', 'general', 'seed'),
  ('todaytix', 'TodayTix', 'Entertainment', 'general', 'seed'),
  ('broadway.com', 'Broadway', 'Entertainment', 'general', 'seed'),
  ('national theatre', 'National Theatre', 'Entertainment', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- VPN / SECURITY / PASSWORD MANAGERS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- VPN
  ('nordvpn', 'NordVPN', 'Bills & Utilities', 'subscription', 'NordVPN', 'seed'),
  ('nordvpn.com', 'NordVPN', 'Bills & Utilities', 'subscription', 'NordVPN', 'seed'),
  ('expressvpn', 'ExpressVPN', 'Bills & Utilities', 'subscription', 'ExpressVPN', 'seed'),
  ('expressvpn.com', 'ExpressVPN', 'Bills & Utilities', 'subscription', 'ExpressVPN', 'seed'),
  ('surfshark', 'Surfshark', 'Bills & Utilities', 'subscription', 'Surfshark', 'seed'),
  ('surfshark.com', 'Surfshark', 'Bills & Utilities', 'subscription', 'Surfshark', 'seed'),
  ('protonvpn', 'ProtonVPN', 'Bills & Utilities', 'subscription', 'ProtonVPN', 'seed'),
  ('proton vpn', 'ProtonVPN', 'Bills & Utilities', 'subscription', 'ProtonVPN', 'seed'),
  ('private internet access', 'PIA', 'Bills & Utilities', 'subscription', 'PIA', 'seed'),
  ('mullvad vpn', 'Mullvad', 'Bills & Utilities', 'subscription', 'Mullvad', 'seed'),
  ('cyberghost', 'CyberGhost', 'Bills & Utilities', 'subscription', 'CyberGhost', 'seed'),
  -- Password Managers
  ('1password', '1Password', 'Bills & Utilities', 'subscription', '1Password', 'seed'),
  ('1password.com', '1Password', 'Bills & Utilities', 'subscription', '1Password', 'seed'),
  ('lastpass', 'LastPass', 'Bills & Utilities', 'subscription', 'LastPass', 'seed'),
  ('lastpass.com', 'LastPass', 'Bills & Utilities', 'subscription', 'LastPass', 'seed'),
  ('bitwarden', 'Bitwarden', 'Bills & Utilities', 'subscription', 'Bitwarden', 'seed'),
  ('dashlane', 'Dashlane', 'Bills & Utilities', 'subscription', 'Dashlane', 'seed'),
  -- Antivirus / Security
  ('norton', 'Norton', 'Bills & Utilities', 'subscription', 'Norton', 'seed'),
  ('norton lifelock', 'Norton', 'Bills & Utilities', 'subscription', 'Norton', 'seed'),
  ('mcafee', 'McAfee', 'Bills & Utilities', 'subscription', 'McAfee', 'seed'),
  ('mcafee.com', 'McAfee', 'Bills & Utilities', 'subscription', 'McAfee', 'seed'),
  ('kaspersky', 'Kaspersky', 'Bills & Utilities', 'subscription', 'Kaspersky', 'seed'),
  ('bitdefender', 'Bitdefender', 'Bills & Utilities', 'subscription', 'Bitdefender', 'seed'),
  ('malwarebytes', 'Malwarebytes', 'Bills & Utilities', 'subscription', 'Malwarebytes', 'seed'),
  ('avg', 'AVG', 'Bills & Utilities', 'subscription', 'AVG', 'seed'),
  ('avast', 'Avast', 'Bills & Utilities', 'subscription', 'Avast', 'seed'),
  ('eset', 'ESET', 'Bills & Utilities', 'subscription', 'ESET', 'seed'),
  ('webroot', 'Webroot', 'Bills & Utilities', 'subscription', 'Webroot', 'seed'),
  -- Email
  ('proton mail', 'Proton Mail', 'Bills & Utilities', 'subscription', 'Proton Mail', 'seed'),
  ('protonmail', 'Proton Mail', 'Bills & Utilities', 'subscription', 'Proton Mail', 'seed'),
  ('tutanota', 'Tuta', 'Bills & Utilities', 'subscription', 'Tuta', 'seed'),
  ('fastmail', 'Fastmail', 'Bills & Utilities', 'subscription', 'Fastmail', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- DELIVERY & COURIER SERVICES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Global
  ('fedex', 'FedEx', 'Shopping', 'general', 'seed'),
  ('fedex.com', 'FedEx', 'Shopping', 'general', 'seed'),
  ('federal express', 'FedEx', 'Shopping', 'general', 'seed'),
  ('ups', 'UPS', 'Shopping', 'general', 'seed'),
  ('ups.com', 'UPS', 'Shopping', 'general', 'seed'),
  ('united parcel service', 'UPS', 'Shopping', 'general', 'seed'),
  ('dhl', 'DHL', 'Shopping', 'general', 'seed'),
  ('dhl express', 'DHL', 'Shopping', 'general', 'seed'),
  ('dhl.com', 'DHL', 'Shopping', 'general', 'seed'),
  -- US
  ('usps', 'USPS', 'Shopping', 'general', 'seed'),
  ('usps.com', 'USPS', 'Shopping', 'general', 'seed'),
  ('united states postal', 'USPS', 'Shopping', 'general', 'seed'),
  -- UK
  ('royal mail', 'Royal Mail', 'Shopping', 'general', 'seed'),
  ('parcelforce', 'Parcelforce', 'Shopping', 'general', 'seed'),
  ('evri', 'Evri', 'Shopping', 'general', 'seed'),
  ('hermes parcel', 'Evri', 'Shopping', 'general', 'seed'),
  ('dpd', 'DPD', 'Shopping', 'general', 'seed'),
  ('dpd parcel', 'DPD', 'Shopping', 'general', 'seed'),
  ('yodel', 'Yodel', 'Shopping', 'general', 'seed'),
  ('inpost', 'InPost', 'Shopping', 'general', 'seed'),
  ('collectplus', 'CollectPlus', 'Shopping', 'general', 'seed'),
  -- AU
  ('australia post', 'Australia Post', 'Shopping', 'general', 'seed'),
  ('auspost', 'Australia Post', 'Shopping', 'general', 'seed'),
  ('sendle', 'Sendle', 'Shopping', 'general', 'seed'),
  -- Canada
  ('canada post', 'Canada Post', 'Shopping', 'general', 'seed'),
  ('purolator', 'Purolator', 'Shopping', 'general', 'seed'),
  -- Europe
  ('la poste', 'La Poste', 'Shopping', 'general', 'seed'),
  ('deutsche post', 'Deutsche Post', 'Shopping', 'general', 'seed'),
  ('postnord', 'PostNord', 'Shopping', 'general', 'seed'),
  ('poste italiane', 'Poste Italiane', 'Shopping', 'general', 'seed'),
  ('correos', 'Correos', 'Shopping', 'general', 'seed'),
  -- ME / Asia
  ('aramex', 'Aramex', 'Shopping', 'general', 'seed'),
  ('fetchr', 'Fetchr', 'Shopping', 'general', 'seed'),
  ('j&t express', 'J&T Express', 'Shopping', 'general', 'seed'),
  ('ninja van', 'Ninja Van', 'Shopping', 'general', 'seed'),
  ('sf express', 'SF Express', 'Shopping', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- TRAVEL — OTAs, VACATION RENTALS, CRUISES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- OTAs (extended)
  ('tripadvisor', 'TripAdvisor', 'Entertainment', 'general', 'seed'),
  ('tripadvisor.com', 'TripAdvisor', 'Entertainment', 'general', 'seed'),
  ('trivago', 'trivago', 'Entertainment', 'general', 'seed'),
  ('hotels.com', 'Hotels.com', 'Entertainment', 'general', 'seed'),
  ('priceline', 'Priceline', 'Entertainment', 'general', 'seed'),
  ('priceline.com', 'Priceline', 'Entertainment', 'general', 'seed'),
  ('hopper', 'Hopper', 'Entertainment', 'general', 'seed'),
  ('skyscanner', 'Skyscanner', 'Entertainment', 'general', 'seed'),
  ('kayak', 'Kayak', 'Entertainment', 'general', 'seed'),
  ('kayak.com', 'Kayak', 'Entertainment', 'general', 'seed'),
  ('momondo', 'Momondo', 'Entertainment', 'general', 'seed'),
  ('travelocity', 'Travelocity', 'Entertainment', 'general', 'seed'),
  ('orbitz', 'Orbitz', 'Entertainment', 'general', 'seed'),
  ('cheapoair', 'CheapOAir', 'Entertainment', 'general', 'seed'),
  ('secret escapes', 'Secret Escapes', 'Entertainment', 'general', 'seed'),
  ('lastminute.com', 'lastminute.com', 'Entertainment', 'general', 'seed'),
  ('opodo', 'Opodo', 'Entertainment', 'general', 'seed'),
  ('kiwi.com', 'Kiwi.com', 'Entertainment', 'general', 'seed'),
  ('google flights', 'Google Flights', 'Entertainment', 'general', 'seed'),
  -- Vacation Rentals
  ('airbnb', 'Airbnb', 'Entertainment', 'general', 'seed'),
  ('airbnb.com', 'Airbnb', 'Entertainment', 'general', 'seed'),
  ('vrbo', 'Vrbo', 'Entertainment', 'general', 'seed'),
  ('vrbo.com', 'Vrbo', 'Entertainment', 'general', 'seed'),
  ('booking.com', 'Booking.com', 'Entertainment', 'general', 'seed'),
  ('hostelworld', 'Hostelworld', 'Entertainment', 'general', 'seed'),
  ('hostelworld.com', 'Hostelworld', 'Entertainment', 'general', 'seed'),
  ('homestay.com', 'Homestay', 'Entertainment', 'general', 'seed'),
  ('plumguide', 'Plum Guide', 'Entertainment', 'general', 'seed'),
  -- Cruises
  ('royal caribbean', 'Royal Caribbean', 'Entertainment', 'general', 'seed'),
  ('royalcaribbean.com', 'Royal Caribbean', 'Entertainment', 'general', 'seed'),
  ('carnival cruise', 'Carnival', 'Entertainment', 'general', 'seed'),
  ('carnival.com', 'Carnival', 'Entertainment', 'general', 'seed'),
  ('norwegian cruise', 'Norwegian Cruise Line', 'Entertainment', 'general', 'seed'),
  ('ncl.com', 'Norwegian Cruise Line', 'Entertainment', 'general', 'seed'),
  ('msc cruises', 'MSC Cruises', 'Entertainment', 'general', 'seed'),
  ('celebrity cruises', 'Celebrity Cruises', 'Entertainment', 'general', 'seed'),
  ('princess cruises', 'Princess Cruises', 'Entertainment', 'general', 'seed'),
  ('disney cruise', 'Disney Cruise Line', 'Entertainment', 'general', 'seed'),
  ('viking cruises', 'Viking', 'Entertainment', 'general', 'seed'),
  ('cunard', 'Cunard', 'Entertainment', 'general', 'seed'),
  ('p&o cruises', 'P&O Cruises', 'Entertainment', 'general', 'seed'),
  ('holland america', 'Holland America', 'Entertainment', 'general', 'seed'),
  -- Tour Operators
  ('tui', 'TUI', 'Entertainment', 'general', 'seed'),
  ('tui.com', 'TUI', 'Entertainment', 'general', 'seed'),
  ('jet2holidays', 'Jet2holidays', 'Entertainment', 'general', 'seed'),
  ('easyjet holidays', 'easyJet holidays', 'Entertainment', 'general', 'seed'),
  ('g adventures', 'G Adventures', 'Entertainment', 'general', 'seed'),
  ('intrepid travel', 'Intrepid Travel', 'Entertainment', 'general', 'seed'),
  ('contiki', 'Contiki', 'Entertainment', 'general', 'seed'),
  ('trafalgar tours', 'Trafalgar', 'Entertainment', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- MICRO-MOBILITY (scooters, bikes)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('lime', 'Lime', 'Transport', 'transport', 'seed'),
  ('lime scooter', 'Lime', 'Transport', 'transport', 'seed'),
  ('li.me', 'Lime', 'Transport', 'transport', 'seed'),
  ('bird scooter', 'Bird', 'Transport', 'transport', 'seed'),
  ('bird rides', 'Bird', 'Transport', 'transport', 'seed'),
  ('voi', 'Voi', 'Transport', 'transport', 'seed'),
  ('voi scooter', 'Voi', 'Transport', 'transport', 'seed'),
  ('tier scooter', 'TIER', 'Transport', 'transport', 'seed'),
  ('tier mobility', 'TIER', 'Transport', 'transport', 'seed'),
  ('spin scooter', 'Spin', 'Transport', 'transport', 'seed'),
  ('neuron mobility', 'Neuron', 'Transport', 'transport', 'seed'),
  ('beam scooter', 'Beam', 'Transport', 'transport', 'seed'),
  ('citi bike', 'Citi Bike', 'Transport', 'transport', 'seed'),
  ('santander cycles', 'Santander Cycles', 'Transport', 'transport', 'seed'),
  ('tfl cycle hire', 'Santander Cycles', 'Transport', 'transport', 'seed'),
  ('divvy', 'Divvy', 'Transport', 'transport', 'seed'),
  ('capital bikeshare', 'Capital Bikeshare', 'Transport', 'transport', 'seed'),
  ('bay wheels', 'Bay Wheels', 'Transport', 'transport', 'seed'),
  ('boris bikes', 'Santander Cycles', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CAR SHARING & RENTAL (extended)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('zipcar', 'Zipcar', 'Transport', 'transport', 'seed'),
  ('zipcar.com', 'Zipcar', 'Transport', 'transport', 'seed'),
  ('turo', 'Turo', 'Transport', 'transport', 'seed'),
  ('turo.com', 'Turo', 'Transport', 'transport', 'seed'),
  ('getaround', 'Getaround', 'Transport', 'transport', 'seed'),
  ('enterprise rent', 'Enterprise', 'Transport', 'transport', 'seed'),
  ('enterprise.com', 'Enterprise', 'Transport', 'transport', 'seed'),
  ('hertz', 'Hertz', 'Transport', 'transport', 'seed'),
  ('hertz.com', 'Hertz', 'Transport', 'transport', 'seed'),
  ('avis', 'Avis', 'Transport', 'transport', 'seed'),
  ('avis.com', 'Avis', 'Transport', 'transport', 'seed'),
  ('budget rent', 'Budget', 'Transport', 'transport', 'seed'),
  ('national car rental', 'National', 'Transport', 'transport', 'seed'),
  ('sixt', 'Sixt', 'Transport', 'transport', 'seed'),
  ('sixt.com', 'Sixt', 'Transport', 'transport', 'seed'),
  ('europcar', 'Europcar', 'Transport', 'transport', 'seed'),
  ('europcar.com', 'Europcar', 'Transport', 'transport', 'seed'),
  ('thrifty', 'Thrifty', 'Transport', 'transport', 'seed'),
  ('dollar rent a car', 'Dollar', 'Transport', 'transport', 'seed'),
  ('alamo rent', 'Alamo', 'Transport', 'transport', 'seed'),
  ('goget', 'GoGet', 'Transport', 'transport', 'seed'),
  ('drivenow', 'DriveNow', 'Transport', 'transport', 'seed'),
  ('share now', 'ShareNow', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- FERRIES & MARITIME
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('p&o ferries', 'P&O Ferries', 'Transport', 'transport', 'seed'),
  ('stena line', 'Stena Line', 'Transport', 'transport', 'seed'),
  ('irish ferries', 'Irish Ferries', 'Transport', 'transport', 'seed'),
  ('dfds', 'DFDS', 'Transport', 'transport', 'seed'),
  ('dfds seaways', 'DFDS', 'Transport', 'transport', 'seed'),
  ('brittany ferries', 'Brittany Ferries', 'Transport', 'transport', 'seed'),
  ('condor ferries', 'Condor Ferries', 'Transport', 'transport', 'seed'),
  ('wightlink', 'Wightlink', 'Transport', 'transport', 'seed'),
  ('red funnel', 'Red Funnel', 'Transport', 'transport', 'seed'),
  ('caledonian macbrayne', 'CalMac', 'Transport', 'transport', 'seed'),
  ('calmac', 'CalMac', 'Transport', 'transport', 'seed'),
  ('bc ferries', 'BC Ferries', 'Transport', 'transport', 'seed'),
  ('washington state ferries', 'WSF', 'Transport', 'transport', 'seed'),
  ('spirit of tasmania', 'Spirit of Tasmania', 'Transport', 'transport', 'seed'),
  ('viking line', 'Viking Line', 'Transport', 'transport', 'seed'),
  ('tallink', 'Tallink', 'Transport', 'transport', 'seed'),
  ('color line', 'Color Line', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- TRAINS (extended worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US / Canada
  ('amtrak', 'Amtrak', 'Transport', 'transport', 'seed'),
  ('amtrak.com', 'Amtrak', 'Transport', 'transport', 'seed'),
  ('via rail', 'VIA Rail', 'Transport', 'transport', 'seed'),
  -- Europe
  ('eurostar', 'Eurostar', 'Transport', 'transport', 'seed'),
  ('eurostar.com', 'Eurostar', 'Transport', 'transport', 'seed'),
  ('sncf', 'SNCF', 'Transport', 'transport', 'seed'),
  ('tgv', 'SNCF', 'Transport', 'transport', 'seed'),
  ('oui.sncf', 'SNCF', 'Transport', 'transport', 'seed'),
  ('deutsche bahn', 'Deutsche Bahn', 'Transport', 'transport', 'seed'),
  ('db bahn', 'Deutsche Bahn', 'Transport', 'transport', 'seed'),
  ('trenitalia', 'Trenitalia', 'Transport', 'transport', 'seed'),
  ('italo treno', 'Italo', 'Transport', 'transport', 'seed'),
  ('renfe', 'Renfe', 'Transport', 'transport', 'seed'),
  ('sbb', 'SBB', 'Transport', 'transport', 'seed'),
  ('ns international', 'NS', 'Transport', 'transport', 'seed'),
  ('thalys', 'Thalys', 'Transport', 'transport', 'seed'),
  ('obb', 'ÖBB', 'Transport', 'transport', 'seed'),
  ('dsb', 'DSB', 'Transport', 'transport', 'seed'),
  ('sj', 'SJ', 'Transport', 'transport', 'seed'),
  -- UK (extended)
  ('avanti west coast', 'Avanti', 'Transport', 'transport', 'seed'),
  ('lner', 'LNER', 'Transport', 'transport', 'seed'),
  ('great western railway', 'GWR', 'Transport', 'transport', 'seed'),
  ('gwr', 'GWR', 'Transport', 'transport', 'seed'),
  ('crosscountry', 'CrossCountry', 'Transport', 'transport', 'seed'),
  ('southeastern railway', 'Southeastern', 'Transport', 'transport', 'seed'),
  ('southern railway', 'Southern', 'Transport', 'transport', 'seed'),
  ('thameslink', 'Thameslink', 'Transport', 'transport', 'seed'),
  ('scotrail', 'ScotRail', 'Transport', 'transport', 'seed'),
  ('northern trains', 'Northern', 'Transport', 'transport', 'seed'),
  ('transpennine express', 'TransPennine', 'Transport', 'transport', 'seed'),
  ('elizabeth line', 'Elizabeth Line', 'Transport', 'transport', 'seed'),
  ('chiltern railways', 'Chiltern', 'Transport', 'transport', 'seed'),
  ('east midlands railway', 'East Midlands', 'Transport', 'transport', 'seed'),
  ('c2c', 'c2c', 'Transport', 'transport', 'seed'),
  ('trainline', 'Trainline', 'Transport', 'transport', 'seed'),
  ('trainline.com', 'Trainline', 'Transport', 'transport', 'seed'),
  -- AU/NZ
  ('nsw trainlink', 'NSW TrainLink', 'Transport', 'transport', 'seed'),
  ('v/line', 'V/Line', 'Transport', 'transport', 'seed'),
  ('transperth', 'Transperth', 'Transport', 'transport', 'seed'),
  -- Japan
  ('jr east', 'JR East', 'Transport', 'transport', 'seed'),
  ('jr west', 'JR West', 'Transport', 'transport', 'seed'),
  ('shinkansen', 'Shinkansen', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- BUSES & COACHES (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US / Canada
  ('greyhound', 'Greyhound', 'Transport', 'transport', 'seed'),
  ('greyhound.com', 'Greyhound', 'Transport', 'transport', 'seed'),
  ('peter pan bus', 'Peter Pan', 'Transport', 'transport', 'seed'),
  ('ourbus', 'OurBus', 'Transport', 'transport', 'seed'),
  ('redcoach', 'RedCoach', 'Transport', 'transport', 'seed'),
  -- UK
  ('national express', 'National Express', 'Transport', 'transport', 'seed'),
  ('megabus', 'Megabus', 'Transport', 'transport', 'seed'),
  ('megabus.com', 'Megabus', 'Transport', 'transport', 'seed'),
  ('stagecoach', 'Stagecoach', 'Transport', 'transport', 'seed'),
  ('arriva', 'Arriva', 'Transport', 'transport', 'seed'),
  ('first bus', 'FirstBus', 'Transport', 'transport', 'seed'),
  ('go-ahead', 'Go-Ahead', 'Transport', 'transport', 'seed'),
  ('lothian buses', 'Lothian', 'Transport', 'transport', 'seed'),
  -- Europe
  ('flixbus', 'FlixBus', 'Transport', 'transport', 'seed'),
  ('flixbus.com', 'FlixBus', 'Transport', 'transport', 'seed'),
  ('blablabus', 'BlaBlaBus', 'Transport', 'transport', 'seed'),
  ('isilines', 'isilines', 'Transport', 'transport', 'seed'),
  ('eurolines', 'Eurolines', 'Transport', 'transport', 'seed'),
  -- AU
  ('greyhound australia', 'Greyhound AU', 'Transport', 'transport', 'seed'),
  ('firefly express', 'Firefly', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- AIRLINES (extended — budget & regional worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US Budget
  ('frontier airlines', 'Frontier', 'Transport', 'transport', 'seed'),
  ('spirit airlines', 'Spirit', 'Transport', 'transport', 'seed'),
  ('allegiant air', 'Allegiant', 'Transport', 'transport', 'seed'),
  ('sun country airlines', 'Sun Country', 'Transport', 'transport', 'seed'),
  ('breeze airways', 'Breeze', 'Transport', 'transport', 'seed'),
  -- Europe Budget
  ('wizz air', 'Wizz Air', 'Transport', 'transport', 'seed'),
  ('wizzair.com', 'Wizz Air', 'Transport', 'transport', 'seed'),
  ('pegasus airlines', 'Pegasus', 'Transport', 'transport', 'seed'),
  ('volotea', 'Volotea', 'Transport', 'transport', 'seed'),
  ('transavia', 'Transavia', 'Transport', 'transport', 'seed'),
  ('eurowings', 'Eurowings', 'Transport', 'transport', 'seed'),
  ('norwegian air', 'Norwegian', 'Transport', 'transport', 'seed'),
  ('play airlines', 'PLAY', 'Transport', 'transport', 'seed'),
  -- Asia Budget
  ('airasia', 'AirAsia', 'Transport', 'transport', 'seed'),
  ('airasia.com', 'AirAsia', 'Transport', 'transport', 'seed'),
  ('indigo airlines', 'IndiGo', 'Transport', 'transport', 'seed'),
  ('indigo 6e', 'IndiGo', 'Transport', 'transport', 'seed'),
  ('spicejet', 'SpiceJet', 'Transport', 'transport', 'seed'),
  ('cebu pacific', 'Cebu Pacific', 'Transport', 'transport', 'seed'),
  ('lion air', 'Lion Air', 'Transport', 'transport', 'seed'),
  ('scoot airlines', 'Scoot', 'Transport', 'transport', 'seed'),
  ('vietjet', 'VietJet', 'Transport', 'transport', 'seed'),
  ('air india express', 'Air India Express', 'Transport', 'transport', 'seed'),
  -- LATAM Budget
  ('volaris', 'Volaris', 'Transport', 'transport', 'seed'),
  ('vivaaerobus', 'VivaAerobus', 'Transport', 'transport', 'seed'),
  ('gol airlines', 'GOL', 'Transport', 'transport', 'seed'),
  ('azul airlines', 'Azul', 'Transport', 'transport', 'seed'),
  ('jetsmart', 'JetSMART', 'Transport', 'transport', 'seed'),
  -- Africa / ME
  ('flydubai', 'flydubai', 'Transport', 'transport', 'seed'),
  ('air arabia', 'Air Arabia', 'Transport', 'transport', 'seed'),
  ('flynas', 'flynas', 'Transport', 'transport', 'seed'),
  ('mango airlines', 'Mango', 'Transport', 'transport', 'seed'),
  ('fastjet', 'Fastjet', 'Transport', 'transport', 'seed'),
  -- Full-Service (additional worldwide)
  ('air france', 'Air France', 'Transport', 'transport', 'seed'),
  ('klm', 'KLM', 'Transport', 'transport', 'seed'),
  ('lufthansa', 'Lufthansa', 'Transport', 'transport', 'seed'),
  ('iberia', 'Iberia', 'Transport', 'transport', 'seed'),
  ('swiss air', 'SWISS', 'Transport', 'transport', 'seed'),
  ('austrian airlines', 'Austrian', 'Transport', 'transport', 'seed'),
  ('brussels airlines', 'Brussels Airlines', 'Transport', 'transport', 'seed'),
  ('tap portugal', 'TAP', 'Transport', 'transport', 'seed'),
  ('lot polish', 'LOT', 'Transport', 'transport', 'seed'),
  ('finnair', 'Finnair', 'Transport', 'transport', 'seed'),
  ('sas scandinavian', 'SAS', 'Transport', 'transport', 'seed'),
  ('icelandair', 'Icelandair', 'Transport', 'transport', 'seed'),
  ('aer lingus', 'Aer Lingus', 'Transport', 'transport', 'seed'),
  ('japan airlines', 'JAL', 'Transport', 'transport', 'seed'),
  ('ana airlines', 'ANA', 'Transport', 'transport', 'seed'),
  ('korean air', 'Korean Air', 'Transport', 'transport', 'seed'),
  ('asiana airlines', 'Asiana', 'Transport', 'transport', 'seed'),
  ('china southern', 'China Southern', 'Transport', 'transport', 'seed'),
  ('china eastern', 'China Eastern', 'Transport', 'transport', 'seed'),
  ('air china', 'Air China', 'Transport', 'transport', 'seed'),
  ('cathay pacific', 'Cathay Pacific', 'Transport', 'transport', 'seed'),
  ('garuda indonesia', 'Garuda', 'Transport', 'transport', 'seed'),
  ('malaysia airlines', 'Malaysia Airlines', 'Transport', 'transport', 'seed'),
  ('thai airways', 'Thai Airways', 'Transport', 'transport', 'seed'),
  ('vietnam airlines', 'Vietnam Airlines', 'Transport', 'transport', 'seed'),
  ('philippine airlines', 'Philippine Airlines', 'Transport', 'transport', 'seed'),
  ('air new zealand', 'Air New Zealand', 'Transport', 'transport', 'seed'),
  ('latam airlines', 'LATAM', 'Transport', 'transport', 'seed'),
  ('avianca', 'Avianca', 'Transport', 'transport', 'seed'),
  ('copa airlines', 'Copa', 'Transport', 'transport', 'seed'),
  ('south african airways', 'SAA', 'Transport', 'transport', 'seed'),
  ('kenya airways', 'Kenya Airways', 'Transport', 'transport', 'seed'),
  ('ethiopian airlines', 'Ethiopian', 'Transport', 'transport', 'seed'),
  ('royal air maroc', 'Royal Air Maroc', 'Transport', 'transport', 'seed'),
  ('egypt air', 'EgyptAir', 'Transport', 'transport', 'seed'),
  ('gulf air', 'Gulf Air', 'Transport', 'transport', 'seed'),
  ('oman air', 'Oman Air', 'Transport', 'transport', 'seed'),
  ('saudia', 'Saudia', 'Transport', 'transport', 'seed'),
  ('el al', 'El Al', 'Transport', 'transport', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- DATING APPS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('tinder', 'Tinder', 'Entertainment', 'subscription', 'Tinder', 'seed'),
  ('tinder gold', 'Tinder', 'Entertainment', 'subscription', 'Tinder Gold', 'seed'),
  ('tinder plus', 'Tinder', 'Entertainment', 'subscription', 'Tinder Plus', 'seed'),
  ('bumble', 'Bumble', 'Entertainment', 'subscription', 'Bumble', 'seed'),
  ('bumble premium', 'Bumble', 'Entertainment', 'subscription', 'Bumble Premium', 'seed'),
  ('hinge', 'Hinge', 'Entertainment', 'subscription', 'Hinge', 'seed'),
  ('hinge preferred', 'Hinge', 'Entertainment', 'subscription', 'Hinge Preferred', 'seed'),
  ('match.com', 'Match.com', 'Entertainment', 'subscription', 'Match.com', 'seed'),
  ('match group', 'Match.com', 'Entertainment', 'subscription', 'Match.com', 'seed'),
  ('okcupid', 'OkCupid', 'Entertainment', 'subscription', 'OkCupid', 'seed'),
  ('eharmony', 'eHarmony', 'Entertainment', 'subscription', 'eHarmony', 'seed'),
  ('eharmony.com', 'eHarmony', 'Entertainment', 'subscription', 'eHarmony', 'seed'),
  ('grindr', 'Grindr', 'Entertainment', 'subscription', 'Grindr', 'seed'),
  ('badoo', 'Badoo', 'Entertainment', 'subscription', 'Badoo', 'seed'),
  ('plenty of fish', 'Plenty of Fish', 'Entertainment', 'subscription', 'Plenty of Fish', 'seed'),
  ('pof.com', 'Plenty of Fish', 'Entertainment', 'subscription', 'Plenty of Fish', 'seed'),
  ('happn', 'Happn', 'Entertainment', 'subscription', 'Happn', 'seed'),
  ('coffee meets bagel', 'Coffee Meets Bagel', 'Entertainment', 'subscription', 'Coffee Meets Bagel', 'seed'),
  ('the league', 'The League', 'Entertainment', 'subscription', 'The League', 'seed'),
  ('feeld', 'Feeld', 'Entertainment', 'subscription', 'Feeld', 'seed'),
  ('raya', 'Raya', 'Entertainment', 'subscription', 'Raya', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- SOCIAL MEDIA SUBSCRIPTIONS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('youtube premium', 'YouTube Premium', 'Entertainment', 'subscription', 'YouTube Premium', 'seed'),
  ('youtube music', 'YouTube Music', 'Entertainment', 'subscription', 'YouTube Music', 'seed'),
  ('youtube tv', 'YouTube TV', 'Entertainment', 'subscription', 'YouTube TV', 'seed'),
  ('reddit premium', 'Reddit', 'Entertainment', 'subscription', 'Reddit Premium', 'seed'),
  ('discord nitro', 'Discord', 'Entertainment', 'subscription', 'Discord Nitro', 'seed'),
  ('discord', 'Discord', 'Entertainment', 'subscription', 'Discord Nitro', 'seed'),
  ('snapchat+', 'Snapchat', 'Entertainment', 'subscription', 'Snapchat+', 'seed'),
  ('snapchat plus', 'Snapchat', 'Entertainment', 'subscription', 'Snapchat+', 'seed'),
  ('x premium', 'X', 'Entertainment', 'subscription', 'X Premium', 'seed'),
  ('twitter blue', 'X', 'Entertainment', 'subscription', 'X Premium', 'seed'),
  ('meta verified', 'Meta', 'Entertainment', 'subscription', 'Meta Verified', 'seed'),
  ('linkedin premium', 'LinkedIn', 'Entertainment', 'subscription', 'LinkedIn Premium', 'seed'),
  ('linkedin learning', 'LinkedIn', 'Education', 'subscription', 'LinkedIn Learning', 'seed'),
  ('tiktok coins', 'TikTok', 'Entertainment', 'general', NULL, 'seed'),
  ('pinterest', 'Pinterest', 'Entertainment', 'general', NULL, 'seed'),
  ('tumblr', 'Tumblr', 'Entertainment', 'subscription', 'Tumblr', 'seed'),
  -- Music Streaming
  ('spotify', 'Spotify', 'Entertainment', 'subscription', 'Spotify', 'seed'),
  ('spotify.com', 'Spotify', 'Entertainment', 'subscription', 'Spotify', 'seed'),
  ('spotify premium', 'Spotify', 'Entertainment', 'subscription', 'Spotify Premium', 'seed'),
  ('apple music', 'Apple Music', 'Entertainment', 'subscription', 'Apple Music', 'seed'),
  ('tidal', 'Tidal', 'Entertainment', 'subscription', 'Tidal', 'seed'),
  ('tidal.com', 'Tidal', 'Entertainment', 'subscription', 'Tidal', 'seed'),
  ('deezer', 'Deezer', 'Entertainment', 'subscription', 'Deezer', 'seed'),
  ('deezer.com', 'Deezer', 'Entertainment', 'subscription', 'Deezer', 'seed'),
  ('soundcloud', 'SoundCloud', 'Entertainment', 'subscription', 'SoundCloud Go', 'seed'),
  ('soundcloud go', 'SoundCloud', 'Entertainment', 'subscription', 'SoundCloud Go', 'seed'),
  ('pandora music', 'Pandora', 'Entertainment', 'subscription', 'Pandora', 'seed'),
  ('pandora.com', 'Pandora', 'Entertainment', 'subscription', 'Pandora', 'seed'),
  ('amazon music', 'Amazon Music', 'Entertainment', 'subscription', 'Amazon Music', 'seed'),
  ('bandcamp', 'Bandcamp', 'Entertainment', 'general', NULL, 'seed'),
  -- Podcasting
  ('pocket casts', 'Pocket Casts', 'Entertainment', 'subscription', 'Pocket Casts', 'seed'),
  ('overcast', 'Overcast', 'Entertainment', 'subscription', 'Overcast', 'seed'),
  ('apple podcasts', 'Apple Podcasts', 'Entertainment', 'subscription', 'Apple Podcasts', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- NEWS & MAGAZINES (extended worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  -- UK
  ('the guardian', 'The Guardian', 'Entertainment', 'subscription', 'Guardian', 'seed'),
  ('guardian.co.uk', 'The Guardian', 'Entertainment', 'subscription', 'Guardian', 'seed'),
  ('theguardian.com', 'The Guardian', 'Entertainment', 'subscription', 'Guardian', 'seed'),
  ('the times', 'The Times', 'Entertainment', 'subscription', 'The Times', 'seed'),
  ('thetimes.co.uk', 'The Times', 'Entertainment', 'subscription', 'The Times', 'seed'),
  ('the telegraph', 'The Telegraph', 'Entertainment', 'subscription', 'Telegraph', 'seed'),
  ('telegraph.co.uk', 'The Telegraph', 'Entertainment', 'subscription', 'Telegraph', 'seed'),
  ('the independent', 'The Independent', 'Entertainment', 'subscription', 'Independent', 'seed'),
  ('the economist', 'The Economist', 'Entertainment', 'subscription', 'The Economist', 'seed'),
  ('economist.com', 'The Economist', 'Entertainment', 'subscription', 'The Economist', 'seed'),
  ('financial times', 'Financial Times', 'Entertainment', 'subscription', 'FT', 'seed'),
  ('ft.com', 'Financial Times', 'Entertainment', 'subscription', 'FT', 'seed'),
  -- US
  ('new york times', 'NYT', 'Entertainment', 'subscription', 'NYT', 'seed'),
  ('nytimes.com', 'NYT', 'Entertainment', 'subscription', 'NYT', 'seed'),
  ('washington post', 'Washington Post', 'Entertainment', 'subscription', 'Washington Post', 'seed'),
  ('washingtonpost.com', 'Washington Post', 'Entertainment', 'subscription', 'Washington Post', 'seed'),
  ('wall street journal', 'WSJ', 'Entertainment', 'subscription', 'WSJ', 'seed'),
  ('wsj.com', 'WSJ', 'Entertainment', 'subscription', 'WSJ', 'seed'),
  ('the atlantic', 'The Atlantic', 'Entertainment', 'subscription', 'The Atlantic', 'seed'),
  ('the new yorker', 'The New Yorker', 'Entertainment', 'subscription', 'The New Yorker', 'seed'),
  ('wired', 'Wired', 'Entertainment', 'subscription', 'Wired', 'seed'),
  ('wired.com', 'Wired', 'Entertainment', 'subscription', 'Wired', 'seed'),
  ('vanity fair', 'Vanity Fair', 'Entertainment', 'subscription', 'Vanity Fair', 'seed'),
  ('national geographic', 'National Geographic', 'Entertainment', 'subscription', 'National Geographic', 'seed'),
  ('time magazine', 'TIME', 'Entertainment', 'subscription', 'TIME', 'seed'),
  ('politico', 'Politico', 'Entertainment', 'subscription', 'Politico', 'seed'),
  ('substack', 'Substack', 'Entertainment', 'subscription', 'Substack', 'seed'),
  ('substack.com', 'Substack', 'Entertainment', 'subscription', 'Substack', 'seed'),
  ('medium', 'Medium', 'Entertainment', 'subscription', 'Medium', 'seed'),
  ('medium.com', 'Medium', 'Entertainment', 'subscription', 'Medium', 'seed'),
  -- AU
  ('the australian', 'The Australian', 'Entertainment', 'subscription', 'The Australian', 'seed'),
  ('sydney morning herald', 'SMH', 'Entertainment', 'subscription', 'SMH', 'seed'),
  -- Global Aggregators
  ('apple news+', 'Apple News+', 'Entertainment', 'subscription', 'Apple News+', 'seed'),
  ('apple news', 'Apple News+', 'Entertainment', 'subscription', 'Apple News+', 'seed'),
  ('google news', 'Google News', 'Entertainment', 'general', NULL, 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- TICKETING & EVENTS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('ticketmaster', 'Ticketmaster', 'Entertainment', 'general', 'seed'),
  ('ticketmaster.com', 'Ticketmaster', 'Entertainment', 'general', 'seed'),
  ('ticketmaster.co.uk', 'Ticketmaster', 'Entertainment', 'general', 'seed'),
  ('stubhub', 'StubHub', 'Entertainment', 'general', 'seed'),
  ('stubhub.com', 'StubHub', 'Entertainment', 'general', 'seed'),
  ('viagogo', 'Viagogo', 'Entertainment', 'general', 'seed'),
  ('seatgeek', 'SeatGeek', 'Entertainment', 'general', 'seed'),
  ('seatgeek.com', 'SeatGeek', 'Entertainment', 'general', 'seed'),
  ('axs', 'AXS', 'Entertainment', 'general', 'seed'),
  ('axs.com', 'AXS', 'Entertainment', 'general', 'seed'),
  ('eventbrite', 'Eventbrite', 'Entertainment', 'general', 'seed'),
  ('eventbrite.com', 'Eventbrite', 'Entertainment', 'general', 'seed'),
  ('dice', 'DICE', 'Entertainment', 'general', 'seed'),
  ('dice.fm', 'DICE', 'Entertainment', 'general', 'seed'),
  ('see tickets', 'See Tickets', 'Entertainment', 'general', 'seed'),
  ('gigantic', 'Gigantic', 'Entertainment', 'general', 'seed'),
  ('skiddle', 'Skiddle', 'Entertainment', 'general', 'seed'),
  ('vivid seats', 'Vivid Seats', 'Entertainment', 'general', 'seed'),
  ('livenation', 'Live Nation', 'Entertainment', 'general', 'seed'),
  ('live nation', 'Live Nation', 'Entertainment', 'general', 'seed'),
  -- Theme Parks / Attractions
  ('alton towers', 'Alton Towers', 'Entertainment', 'general', 'seed'),
  ('thorpe park', 'Thorpe Park', 'Entertainment', 'general', 'seed'),
  ('legoland', 'Legoland', 'Entertainment', 'general', 'seed'),
  ('merlin entertainments', 'Merlin', 'Entertainment', 'general', 'seed'),
  ('six flags', 'Six Flags', 'Entertainment', 'general', 'seed'),
  ('cedar point', 'Cedar Point', 'Entertainment', 'general', 'seed'),
  ('seaworld', 'SeaWorld', 'Entertainment', 'general', 'seed'),
  ('busch gardens', 'Busch Gardens', 'Entertainment', 'general', 'seed'),
  ('madame tussauds', 'Madame Tussauds', 'Entertainment', 'general', 'seed'),
  -- Museums / Heritage
  ('national trust', 'National Trust', 'Entertainment', 'general', 'seed'),
  ('english heritage', 'English Heritage', 'Entertainment', 'general', 'seed'),
  ('historic scotland', 'Historic Scotland', 'Entertainment', 'general', 'seed'),
  ('cadw', 'Cadw', 'Entertainment', 'general', 'seed'),
  ('rhs', 'RHS', 'Entertainment', 'general', 'seed'),
  ('smithsonian', 'Smithsonian', 'Entertainment', 'general', 'seed'),
  ('met museum', 'The Met', 'Entertainment', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- DEPARTMENT STORES (extended worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US
  ('nordstrom rack', 'Nordstrom Rack', 'Shopping', 'retailer', 'seed'),
  ('tj maxx', 'TJ Maxx', 'Shopping', 'retailer', 'seed'),
  ('tjmaxx', 'TJ Maxx', 'Shopping', 'retailer', 'seed'),
  ('marshalls', 'Marshalls', 'Shopping', 'retailer', 'seed'),
  ('ross dress for less', 'Ross', 'Shopping', 'retailer', 'seed'),
  ('ross stores', 'Ross', 'Shopping', 'retailer', 'seed'),
  ('burlington', 'Burlington', 'Shopping', 'retailer', 'seed'),
  ('bloomingdale''s', 'Bloomingdale''s', 'Shopping', 'retailer', 'seed'),
  ('bloomingdales', 'Bloomingdale''s', 'Shopping', 'retailer', 'seed'),
  ('saks fifth avenue', 'Saks', 'Shopping', 'retailer', 'seed'),
  ('neiman marcus', 'Neiman Marcus', 'Shopping', 'retailer', 'seed'),
  ('jcpenney', 'JCPenney', 'Shopping', 'retailer', 'seed'),
  ('jc penney', 'JCPenney', 'Shopping', 'retailer', 'seed'),
  ('kohl''s', 'Kohl''s', 'Shopping', 'retailer', 'seed'),
  ('kohls', 'Kohl''s', 'Shopping', 'retailer', 'seed'),
  ('dillard''s', 'Dillard''s', 'Shopping', 'retailer', 'seed'),
  ('belk', 'Belk', 'Shopping', 'retailer', 'seed'),
  -- UK
  ('selfridges', 'Selfridges', 'Shopping', 'retailer', 'seed'),
  ('selfridges.com', 'Selfridges', 'Shopping', 'retailer', 'seed'),
  ('harrods', 'Harrods', 'Shopping', 'retailer', 'seed'),
  ('harrods.com', 'Harrods', 'Shopping', 'retailer', 'seed'),
  ('harvey nichols', 'Harvey Nichols', 'Shopping', 'retailer', 'seed'),
  ('liberty london', 'Liberty', 'Shopping', 'retailer', 'seed'),
  ('fortnum & mason', 'Fortnum & Mason', 'Shopping', 'retailer', 'seed'),
  ('fortnum and mason', 'Fortnum & Mason', 'Shopping', 'retailer', 'seed'),
  ('tk maxx', 'TK Maxx', 'Shopping', 'retailer', 'seed'),
  ('tkmaxx', 'TK Maxx', 'Shopping', 'retailer', 'seed'),
  ('fenwick', 'Fenwick', 'Shopping', 'retailer', 'seed'),
  -- Europe
  ('galeries lafayette', 'Galeries Lafayette', 'Shopping', 'retailer', 'seed'),
  ('el corte ingles', 'El Corte Inglés', 'Shopping', 'retailer', 'seed'),
  ('rinascente', 'La Rinascente', 'Shopping', 'retailer', 'seed'),
  ('de bijenkorf', 'de Bijenkorf', 'Shopping', 'retailer', 'seed'),
  ('kadewe', 'KaDeWe', 'Shopping', 'retailer', 'seed'),
  ('globus', 'Globus', 'Shopping', 'retailer', 'seed'),
  -- AU
  ('david jones', 'David Jones', 'Shopping', 'retailer', 'seed'),
  ('myer', 'Myer', 'Shopping', 'retailer', 'seed'),
  -- Japan
  ('isetan', 'Isetan', 'Shopping', 'retailer', 'seed'),
  ('takashimaya', 'Takashimaya', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- DISCOUNT / VALUE STORES (worldwide)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- US
  ('dollar tree', 'Dollar Tree', 'Shopping', 'retailer', 'seed'),
  ('dollar general', 'Dollar General', 'Shopping', 'retailer', 'seed'),
  ('five below', 'Five Below', 'Shopping', 'retailer', 'seed'),
  ('99 cents only', '99 Cents Only', 'Shopping', 'retailer', 'seed'),
  ('big lots', 'Big Lots', 'Shopping', 'retailer', 'seed'),
  ('ollie''s bargain', 'Ollie''s', 'Shopping', 'retailer', 'seed'),
  -- UK
  ('poundland', 'Poundland', 'Shopping', 'retailer', 'seed'),
  ('poundstretcher', 'Poundstretcher', 'Shopping', 'retailer', 'seed'),
  ('b&m', 'B&M', 'Shopping', 'retailer', 'seed'),
  ('b&m bargains', 'B&M', 'Shopping', 'retailer', 'seed'),
  ('home bargains', 'Home Bargains', 'Shopping', 'retailer', 'seed'),
  ('flying tiger', 'Flying Tiger', 'Shopping', 'retailer', 'seed'),
  ('quality save', 'Quality Save', 'Shopping', 'retailer', 'seed'),
  -- AU / NZ
  ('the reject shop', 'The Reject Shop', 'Shopping', 'retailer', 'seed'),
  ('daiso', 'Daiso', 'Shopping', 'retailer', 'seed'),
  ('kmart', 'Kmart', 'Shopping', 'retailer', 'seed'),
  -- Europe
  ('action', 'Action', 'Shopping', 'retailer', 'seed'),
  ('normal', 'Normal', 'Shopping', 'retailer', 'seed'),
  ('hema', 'HEMA', 'Shopping', 'retailer', 'seed'),
  ('tiger', 'Tiger', 'Shopping', 'retailer', 'seed'),
  ('nanu nana', 'Nanu-Nana', 'Shopping', 'retailer', 'seed'),
  -- Japan
  ('don quijote', 'Don Quijote', 'Shopping', 'retailer', 'seed'),
  ('seria', 'Seria', 'Shopping', 'retailer', 'seed'),
  ('can do', 'Can Do', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- SECOND-HAND / RESALE PLATFORMS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('depop', 'Depop', 'Shopping', 'general', 'seed'),
  ('depop.com', 'Depop', 'Shopping', 'general', 'seed'),
  ('vinted', 'Vinted', 'Shopping', 'general', 'seed'),
  ('vinted.co.uk', 'Vinted', 'Shopping', 'general', 'seed'),
  ('poshmark', 'Poshmark', 'Shopping', 'general', 'seed'),
  ('poshmark.com', 'Poshmark', 'Shopping', 'general', 'seed'),
  ('thredup', 'ThredUp', 'Shopping', 'general', 'seed'),
  ('mercari', 'Mercari', 'Shopping', 'general', 'seed'),
  ('mercari.com', 'Mercari', 'Shopping', 'general', 'seed'),
  ('vestiaire collective', 'Vestiaire Collective', 'Shopping', 'general', 'seed'),
  ('the realreal', 'The RealReal', 'Shopping', 'general', 'seed'),
  ('therealreal.com', 'The RealReal', 'Shopping', 'general', 'seed'),
  ('rebag', 'Rebag', 'Shopping', 'general', 'seed'),
  ('facebook marketplace', 'Facebook Marketplace', 'Shopping', 'general', 'seed'),
  ('gumtree', 'Gumtree', 'Shopping', 'general', 'seed'),
  ('gumtree.com.au', 'Gumtree', 'Shopping', 'general', 'seed'),
  ('craigslist', 'Craigslist', 'Shopping', 'general', 'seed'),
  ('offerup', 'OfferUp', 'Shopping', 'general', 'seed'),
  ('swappa', 'Swappa', 'Shopping', 'general', 'seed'),
  ('back market', 'Back Market', 'Shopping', 'general', 'seed'),
  ('backmarket.com', 'Back Market', 'Shopping', 'general', 'seed'),
  ('mpb.com', 'MPB', 'Shopping', 'general', 'seed'),
  ('musicmagpie', 'musicMagpie', 'Shopping', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WHOLESALE / CASH & CARRY
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('bj''s wholesale', 'BJ''s', 'Groceries', 'grocery', 'seed'),
  ('bjs wholesale', 'BJ''s', 'Groceries', 'grocery', 'seed'),
  ('makro', 'Makro', 'Groceries', 'grocery', 'seed'),
  ('metro cash', 'Metro', 'Groceries', 'grocery', 'seed'),
  ('booker wholesale', 'Booker', 'Groceries', 'grocery', 'seed'),
  ('bestway', 'Bestway', 'Groceries', 'grocery', 'seed'),
  ('bidfood', 'Bidfood', 'Groceries', 'grocery', 'seed'),
  ('brakes foodservice', 'Brakes', 'Groceries', 'grocery', 'seed'),
  ('sysco', 'Sysco', 'Groceries', 'grocery', 'seed'),
  ('us foods', 'US Foods', 'Groceries', 'grocery', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- TOYS & GAMES RETAIL
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('toys r us', 'Toys R Us', 'Shopping', 'retailer', 'seed'),
  ('smyths toys', 'Smyths', 'Shopping', 'retailer', 'seed'),
  ('smyths', 'Smyths', 'Shopping', 'retailer', 'seed'),
  ('hamleys', 'Hamleys', 'Shopping', 'retailer', 'seed'),
  ('the entertainer', 'The Entertainer', 'Shopping', 'retailer', 'seed'),
  ('lego store', 'LEGO', 'Shopping', 'retailer', 'seed'),
  ('lego.com', 'LEGO', 'Shopping', 'retailer', 'seed'),
  ('build-a-bear', 'Build-A-Bear', 'Shopping', 'retailer', 'seed'),
  ('build a bear', 'Build-A-Bear', 'Shopping', 'retailer', 'seed'),
  ('gamestop', 'GameStop', 'Shopping', 'retailer', 'seed'),
  ('gamestop.com', 'GameStop', 'Shopping', 'retailer', 'seed'),
  ('game uk', 'GAME', 'Shopping', 'retailer', 'seed'),
  ('game.co.uk', 'GAME', 'Shopping', 'retailer', 'seed'),
  ('eb games', 'EB Games', 'Shopping', 'retailer', 'seed'),
  ('toyworld', 'ToyWorld', 'Shopping', 'retailer', 'seed'),
  ('mr toys', 'Mr Toys', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- CRAFTS & HOBBIES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('etsy', 'Etsy', 'Shopping', 'general', 'seed'),
  ('etsy.com', 'Etsy', 'Shopping', 'general', 'seed'),
  ('michaels', 'Michaels', 'Shopping', 'retailer', 'seed'),
  ('michaels.com', 'Michaels', 'Shopping', 'retailer', 'seed'),
  ('joann', 'JOANN', 'Shopping', 'retailer', 'seed'),
  ('joann fabrics', 'JOANN', 'Shopping', 'retailer', 'seed'),
  ('hobbycraft', 'Hobbycraft', 'Shopping', 'retailer', 'seed'),
  ('hobbycraft.co.uk', 'Hobbycraft', 'Shopping', 'retailer', 'seed'),
  ('hobby lobby', 'Hobby Lobby', 'Shopping', 'retailer', 'seed'),
  ('cricut', 'Cricut', 'Shopping', 'retailer', 'seed'),
  ('cricut.com', 'Cricut', 'Shopping', 'retailer', 'seed'),
  ('spotlight', 'Spotlight', 'Shopping', 'retailer', 'seed'),
  ('lincraft', 'Lincraft', 'Shopping', 'retailer', 'seed'),
  ('cass art', 'Cass Art', 'Shopping', 'retailer', 'seed'),
  ('blick art', 'Blick Art', 'Shopping', 'retailer', 'seed'),
  ('jackson''s art', 'Jackson''s Art', 'Shopping', 'retailer', 'seed'),
  ('wh smith', 'WH Smith', 'Shopping', 'retailer', 'seed'),
  ('paperchase', 'Paperchase', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- MUSIC INSTRUMENTS & EQUIPMENT
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('guitar center', 'Guitar Center', 'Shopping', 'retailer', 'seed'),
  ('guitarcenter.com', 'Guitar Center', 'Shopping', 'retailer', 'seed'),
  ('sweetwater', 'Sweetwater', 'Shopping', 'retailer', 'seed'),
  ('sweetwater.com', 'Sweetwater', 'Shopping', 'retailer', 'seed'),
  ('thomann', 'Thomann', 'Shopping', 'retailer', 'seed'),
  ('thomann.de', 'Thomann', 'Shopping', 'retailer', 'seed'),
  ('andertons', 'Andertons', 'Shopping', 'retailer', 'seed'),
  ('andertons.co.uk', 'Andertons', 'Shopping', 'retailer', 'seed'),
  ('gak.co.uk', 'GAK', 'Shopping', 'retailer', 'seed'),
  ('pmt online', 'PMT', 'Shopping', 'retailer', 'seed'),
  ('sam ash', 'Sam Ash', 'Shopping', 'retailer', 'seed'),
  ('musician''s friend', 'Musician''s Friend', 'Shopping', 'retailer', 'seed'),
  ('zzounds', 'zZounds', 'Shopping', 'retailer', 'seed'),
  ('reverb.com', 'Reverb', 'Shopping', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- GARDEN CENTRES & NURSERIES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- UK
  ('dobbies', 'Dobbies', 'Shopping', 'retailer', 'seed'),
  ('dobbies garden centre', 'Dobbies', 'Shopping', 'retailer', 'seed'),
  ('homebase', 'Homebase', 'Shopping', 'retailer', 'seed'),
  ('homebase.co.uk', 'Homebase', 'Shopping', 'retailer', 'seed'),
  ('crocus', 'Crocus', 'Shopping', 'retailer', 'seed'),
  ('crocus.co.uk', 'Crocus', 'Shopping', 'retailer', 'seed'),
  ('notcutts', 'Notcutts', 'Shopping', 'retailer', 'seed'),
  ('squire''s garden', 'Squire''s', 'Shopping', 'retailer', 'seed'),
  -- US
  ('the home depot garden', 'Home Depot', 'Shopping', 'retailer', 'seed'),
  ('lowe''s garden', 'Lowe''s', 'Shopping', 'retailer', 'seed'),
  ('pike nurseries', 'Pike Nurseries', 'Shopping', 'retailer', 'seed'),
  ('armstrong garden', 'Armstrong Garden', 'Shopping', 'retailer', 'seed'),
  -- AU
  ('bunnings garden', 'Bunnings', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- MENTAL HEALTH & THERAPY
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('betterhelp', 'BetterHelp', 'Health', 'subscription', 'BetterHelp', 'seed'),
  ('betterhelp.com', 'BetterHelp', 'Health', 'subscription', 'BetterHelp', 'seed'),
  ('talkspace', 'Talkspace', 'Health', 'subscription', 'Talkspace', 'seed'),
  ('talkspace.com', 'Talkspace', 'Health', 'subscription', 'Talkspace', 'seed'),
  ('cerebral', 'Cerebral', 'Health', 'subscription', 'Cerebral', 'seed'),
  ('cerebral.com', 'Cerebral', 'Health', 'subscription', 'Cerebral', 'seed'),
  ('headspace', 'Headspace', 'Health', 'subscription', 'Headspace', 'seed'),
  ('headspace.com', 'Headspace', 'Health', 'subscription', 'Headspace', 'seed'),
  ('calm', 'Calm', 'Health', 'subscription', 'Calm', 'seed'),
  ('calm.com', 'Calm', 'Health', 'subscription', 'Calm', 'seed'),
  ('noom', 'Noom', 'Health', 'subscription', 'Noom', 'seed'),
  ('noom.com', 'Noom', 'Health', 'subscription', 'Noom', 'seed'),
  ('woebot', 'Woebot', 'Health', 'subscription', 'Woebot', 'seed'),
  ('calmerry', 'Calmerry', 'Health', 'subscription', 'Calmerry', 'seed'),
  ('7cups', '7 Cups', 'Health', 'subscription', '7 Cups', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- HAIR / BARBER / SALON SERVICES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  -- Chains
  ('supercuts', 'Supercuts', 'Shopping', 'general', 'seed'),
  ('great clips', 'Great Clips', 'Shopping', 'general', 'seed'),
  ('toni & guy', 'Toni & Guy', 'Shopping', 'general', 'seed'),
  ('toni and guy', 'Toni & Guy', 'Shopping', 'general', 'seed'),
  ('regis salon', 'Regis', 'Shopping', 'general', 'seed'),
  ('headmasters', 'Headmasters', 'Shopping', 'general', 'seed'),
  ('rush hair', 'Rush', 'Shopping', 'general', 'seed'),
  ('just cuts', 'Just Cuts', 'Shopping', 'general', 'seed'),
  -- Booking Platforms
  ('treatwell', 'Treatwell', 'Shopping', 'general', 'seed'),
  ('treatwell.co.uk', 'Treatwell', 'Shopping', 'general', 'seed'),
  ('fresha', 'Fresha', 'Shopping', 'general', 'seed'),
  ('fresha.com', 'Fresha', 'Shopping', 'general', 'seed'),
  ('booksy', 'Booksy', 'Shopping', 'general', 'seed'),
  ('vagaro', 'Vagaro', 'Shopping', 'general', 'seed'),
  ('styleseat', 'StyleSeat', 'Shopping', 'general', 'seed'),
  ('mindbody', 'Mindbody', 'Shopping', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- FLORISTS & GIFTS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('interflora', 'Interflora', 'Gifts & Charity', 'general', 'seed'),
  ('interflora.co.uk', 'Interflora', 'Gifts & Charity', 'general', 'seed'),
  ('bloom & wild', 'Bloom & Wild', 'Gifts & Charity', 'general', 'seed'),
  ('bloomandwild.com', 'Bloom & Wild', 'Gifts & Charity', 'general', 'seed'),
  ('1-800-flowers', '1-800-Flowers', 'Gifts & Charity', 'general', 'seed'),
  ('ftd', 'FTD', 'Gifts & Charity', 'general', 'seed'),
  ('ftd.com', 'FTD', 'Gifts & Charity', 'general', 'seed'),
  ('the bouqs', 'Bouqs', 'Gifts & Charity', 'general', 'seed'),
  ('teleflora', 'Teleflora', 'Gifts & Charity', 'general', 'seed'),
  ('moonpig', 'Moonpig', 'Gifts & Charity', 'general', 'seed'),
  ('moonpig.com', 'Moonpig', 'Gifts & Charity', 'general', 'seed'),
  ('funky pigeon', 'Funky Pigeon', 'Gifts & Charity', 'general', 'seed'),
  ('thortful', 'thortful', 'Gifts & Charity', 'general', 'seed'),
  ('hallmark', 'Hallmark', 'Gifts & Charity', 'general', 'seed'),
  ('clintons', 'Clintons', 'Gifts & Charity', 'retailer', 'seed'),
  ('card factory', 'Card Factory', 'Gifts & Charity', 'retailer', 'seed'),
  ('notonthehighstreet', 'Not On The High Street', 'Gifts & Charity', 'general', 'seed'),
  ('notonthehighstreet.com', 'Not On The High Street', 'Gifts & Charity', 'general', 'seed'),
  ('uncommon goods', 'Uncommon Goods', 'Gifts & Charity', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- WEDDING & EVENTS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('zola', 'Zola', 'Shopping', 'general', 'seed'),
  ('zola.com', 'Zola', 'Shopping', 'general', 'seed'),
  ('the knot', 'The Knot', 'Shopping', 'general', 'seed'),
  ('theknot.com', 'The Knot', 'Shopping', 'general', 'seed'),
  ('weddingwire', 'WeddingWire', 'Shopping', 'general', 'seed'),
  ('hitched', 'Hitched', 'Shopping', 'general', 'seed'),
  ('hitched.co.uk', 'Hitched', 'Shopping', 'general', 'seed'),
  ('bridebook', 'Bridebook', 'Shopping', 'general', 'seed'),
  ('minted weddings', 'Minted', 'Shopping', 'general', 'seed'),
  ('joy wedding', 'Joy', 'Shopping', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- LEGAL SERVICES
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('legalzoom', 'LegalZoom', 'Bills & Utilities', 'general', 'seed'),
  ('legalzoom.com', 'LegalZoom', 'Bills & Utilities', 'general', 'seed'),
  ('rocket lawyer', 'Rocket Lawyer', 'Bills & Utilities', 'general', 'seed'),
  ('rocketlawyer.com', 'Rocket Lawyer', 'Bills & Utilities', 'general', 'seed'),
  ('law depot', 'LawDepot', 'Bills & Utilities', 'general', 'seed'),
  ('incfile', 'Incfile', 'Bills & Utilities', 'general', 'seed'),
  ('avvo', 'Avvo', 'Bills & Utilities', 'general', 'seed'),
  ('citizens advice', 'Citizens Advice', 'Bills & Utilities', 'general', 'seed'),
  ('law society', 'Law Society', 'Bills & Utilities', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- RECRUITMENT / JOB BOARDS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('indeed', 'Indeed', 'Bills & Utilities', 'general', 'seed'),
  ('indeed.com', 'Indeed', 'Bills & Utilities', 'general', 'seed'),
  ('glassdoor', 'Glassdoor', 'Bills & Utilities', 'general', 'seed'),
  ('glassdoor.com', 'Glassdoor', 'Bills & Utilities', 'general', 'seed'),
  ('reed.co.uk', 'Reed', 'Bills & Utilities', 'general', 'seed'),
  ('monster.com', 'Monster', 'Bills & Utilities', 'general', 'seed'),
  ('totaljobs', 'Totaljobs', 'Bills & Utilities', 'general', 'seed'),
  ('cv-library', 'CV-Library', 'Bills & Utilities', 'general', 'seed'),
  ('seek.com.au', 'SEEK', 'Bills & Utilities', 'general', 'seed'),
  ('ziprecruiter', 'ZipRecruiter', 'Bills & Utilities', 'general', 'seed'),
  ('fiverr', 'Fiverr', 'Bills & Utilities', 'general', 'seed'),
  ('fiverr.com', 'Fiverr', 'Bills & Utilities', 'general', 'seed'),
  ('upwork', 'Upwork', 'Bills & Utilities', 'general', 'seed'),
  ('upwork.com', 'Upwork', 'Bills & Utilities', 'general', 'seed'),
  ('toptal', 'Toptal', 'Bills & Utilities', 'general', 'seed'),
  ('99designs', '99designs', 'Bills & Utilities', 'general', 'seed'),
  ('peopleperhour', 'PeoplePerHour', 'Bills & Utilities', 'general', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- HOME SECURITY / SMART HOME
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('ring', 'Ring', 'Bills & Utilities', 'subscription', 'Ring Protect', 'seed'),
  ('ring.com', 'Ring', 'Bills & Utilities', 'subscription', 'Ring Protect', 'seed'),
  ('ring protect', 'Ring', 'Bills & Utilities', 'subscription', 'Ring Protect', 'seed'),
  ('simplisafe', 'SimpliSafe', 'Bills & Utilities', 'subscription', 'SimpliSafe', 'seed'),
  ('simplisafe.com', 'SimpliSafe', 'Bills & Utilities', 'subscription', 'SimpliSafe', 'seed'),
  ('adt', 'ADT', 'Bills & Utilities', 'subscription', 'ADT', 'seed'),
  ('adt security', 'ADT', 'Bills & Utilities', 'subscription', 'ADT', 'seed'),
  ('vivint', 'Vivint', 'Bills & Utilities', 'subscription', 'Vivint', 'seed'),
  ('vivint.com', 'Vivint', 'Bills & Utilities', 'subscription', 'Vivint', 'seed'),
  ('verisure', 'Verisure', 'Bills & Utilities', 'subscription', 'Verisure', 'seed'),
  ('yale smart', 'Yale', 'Bills & Utilities', 'subscription', 'Yale', 'seed'),
  ('arlo', 'Arlo', 'Bills & Utilities', 'subscription', 'Arlo Secure', 'seed'),
  ('arlo.com', 'Arlo', 'Bills & Utilities', 'subscription', 'Arlo Secure', 'seed'),
  ('wyze', 'Wyze', 'Bills & Utilities', 'subscription', 'Wyze Cam Plus', 'seed'),
  ('wyze.com', 'Wyze', 'Bills & Utilities', 'subscription', 'Wyze Cam Plus', 'seed'),
  ('nest cam', 'Nest', 'Bills & Utilities', 'subscription', 'Nest Aware', 'seed'),
  ('google nest', 'Nest', 'Bills & Utilities', 'subscription', 'Nest Aware', 'seed'),
  ('eufy', 'eufy', 'Bills & Utilities', 'subscription', 'eufy', 'seed'),
  ('abode security', 'Abode', 'Bills & Utilities', 'subscription', 'Abode', 'seed'),
  ('cove security', 'Cove', 'Bills & Utilities', 'subscription', 'Cove', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- MATTRESS & SLEEP
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('casper', 'Casper', 'Shopping', 'retailer', 'seed'),
  ('casper.com', 'Casper', 'Shopping', 'retailer', 'seed'),
  ('emma mattress', 'Emma', 'Shopping', 'retailer', 'seed'),
  ('emma-sleep', 'Emma', 'Shopping', 'retailer', 'seed'),
  ('simba sleep', 'Simba', 'Shopping', 'retailer', 'seed'),
  ('simbasleep.com', 'Simba', 'Shopping', 'retailer', 'seed'),
  ('purple mattress', 'Purple', 'Shopping', 'retailer', 'seed'),
  ('purple.com', 'Purple', 'Shopping', 'retailer', 'seed'),
  ('tempur-pedic', 'Tempur-Pedic', 'Shopping', 'retailer', 'seed'),
  ('tempurpedic', 'Tempur-Pedic', 'Shopping', 'retailer', 'seed'),
  ('sleep number', 'Sleep Number', 'Shopping', 'retailer', 'seed'),
  ('nectar sleep', 'Nectar', 'Shopping', 'retailer', 'seed'),
  ('nectarsleep.com', 'Nectar', 'Shopping', 'retailer', 'seed'),
  ('eve sleep', 'Eve', 'Shopping', 'retailer', 'seed'),
  ('helix sleep', 'Helix', 'Shopping', 'retailer', 'seed'),
  ('koala mattress', 'Koala', 'Shopping', 'retailer', 'seed'),
  ('saatva', 'Saatva', 'Shopping', 'retailer', 'seed'),
  ('tuft & needle', 'Tuft & Needle', 'Shopping', 'retailer', 'seed'),
  ('leesa', 'Leesa', 'Shopping', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- EYEWEAR / CONTACTS (extended)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('specsavers', 'Specsavers', 'Health', 'retailer', 'seed'),
  ('specsavers.co.uk', 'Specsavers', 'Health', 'retailer', 'seed'),
  ('zenni optical', 'Zenni', 'Health', 'retailer', 'seed'),
  ('zennioptical.com', 'Zenni', 'Health', 'retailer', 'seed'),
  ('1-800 contacts', '1-800 Contacts', 'Health', 'retailer', 'seed'),
  ('1800contacts', '1-800 Contacts', 'Health', 'retailer', 'seed'),
  ('glasses direct', 'Glasses Direct', 'Health', 'retailer', 'seed'),
  ('glassesdirect.co.uk', 'Glasses Direct', 'Health', 'retailer', 'seed'),
  ('eyebuydirect', 'EyeBuyDirect', 'Health', 'retailer', 'seed'),
  ('clearly', 'Clearly', 'Health', 'retailer', 'seed'),
  ('optical express', 'Optical Express', 'Health', 'retailer', 'seed'),
  ('boots opticians', 'Boots Opticians', 'Health', 'retailer', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- SOLAR / RENEWABLE ENERGY
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('sunpower', 'SunPower', 'Bills & Utilities', 'utility', 'seed'),
  ('sunrun', 'Sunrun', 'Bills & Utilities', 'utility', 'seed'),
  ('tesla solar', 'Tesla Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('tesla energy', 'Tesla Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('enphase', 'Enphase', 'Bills & Utilities', 'utility', 'seed'),
  ('vivint solar', 'Vivint Solar', 'Bills & Utilities', 'utility', 'seed'),
  ('solaredge', 'SolarEdge', 'Bills & Utilities', 'utility', 'seed'),
  ('palmetto solar', 'Palmetto', 'Bills & Utilities', 'utility', 'seed'),
  ('octopus energy', 'Octopus Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('bulb energy', 'Bulb', 'Bills & Utilities', 'utility', 'seed'),
  ('good energy', 'Good Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('ecotricity', 'Ecotricity', 'Bills & Utilities', 'utility', 'seed'),
  ('origin energy', 'Origin Energy', 'Bills & Utilities', 'utility', 'seed'),
  ('agl', 'AGL', 'Bills & Utilities', 'utility', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- PEST CONTROL & HOME MAINTENANCE
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('rentokil', 'Rentokil', 'Bills & Utilities', 'general', 'seed'),
  ('terminix', 'Terminix', 'Bills & Utilities', 'general', 'seed'),
  ('orkin', 'Orkin', 'Bills & Utilities', 'general', 'seed'),
  ('anticimex', 'Anticimex', 'Bills & Utilities', 'general', 'seed'),
  ('truly nolen', 'Truly Nolen', 'Bills & Utilities', 'general', 'seed'),
  ('british gas homecare', 'British Gas HomeCare', 'Bills & Utilities', 'subscription', 'seed'),
  ('homeserve', 'HomeServe', 'Bills & Utilities', 'subscription', 'seed'),
  ('homeserve.com', 'HomeServe', 'Bills & Utilities', 'subscription', 'seed'),
  ('corgi homeplan', 'Corgi HomePlan', 'Bills & Utilities', 'subscription', 'seed'),
  ('american home shield', 'American Home Shield', 'Bills & Utilities', 'subscription', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- FASHION RENTAL / CLOTHING SUBSCRIPTION
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('rent the runway', 'Rent the Runway', 'Shopping', 'subscription', 'Rent the Runway', 'seed'),
  ('renttherunway.com', 'Rent the Runway', 'Shopping', 'subscription', 'Rent the Runway', 'seed'),
  ('hurr', 'HURR', 'Shopping', 'subscription', 'HURR', 'seed'),
  ('by rotation', 'By Rotation', 'Shopping', 'subscription', 'By Rotation', 'seed'),
  ('nuuly', 'Nuuly', 'Shopping', 'subscription', 'Nuuly', 'seed'),
  ('stitch fix', 'Stitch Fix', 'Shopping', 'subscription', 'Stitch Fix', 'seed'),
  ('stitchfix.com', 'Stitch Fix', 'Shopping', 'subscription', 'Stitch Fix', 'seed'),
  ('trunk club', 'Trunk Club', 'Shopping', 'subscription', 'Trunk Club', 'seed'),
  ('le tote', 'Le Tote', 'Shopping', 'subscription', 'Le Tote', 'seed'),
  ('armoire', 'Armoire', 'Shopping', 'subscription', 'Armoire', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- LANGUAGE LEARNING & TUTORING
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('duolingo', 'Duolingo', 'Education', 'subscription', 'Duolingo Plus', 'seed'),
  ('duolingo.com', 'Duolingo', 'Education', 'subscription', 'Duolingo Plus', 'seed'),
  ('rosetta stone', 'Rosetta Stone', 'Education', 'subscription', 'Rosetta Stone', 'seed'),
  ('babbel', 'Babbel', 'Education', 'subscription', 'Babbel', 'seed'),
  ('babbel.com', 'Babbel', 'Education', 'subscription', 'Babbel', 'seed'),
  ('busuu', 'Busuu', 'Education', 'subscription', 'Busuu', 'seed'),
  ('italki', 'italki', 'Education', 'subscription', 'italki', 'seed'),
  ('italki.com', 'italki', 'Education', 'subscription', 'italki', 'seed'),
  ('preply', 'Preply', 'Education', 'subscription', 'Preply', 'seed'),
  ('preply.com', 'Preply', 'Education', 'subscription', 'Preply', 'seed'),
  ('memrise', 'Memrise', 'Education', 'subscription', 'Memrise', 'seed'),
  ('lingq', 'LingQ', 'Education', 'subscription', 'LingQ', 'seed'),
  ('pimsleur', 'Pimsleur', 'Education', 'subscription', 'Pimsleur', 'seed'),
  ('cambly', 'Cambly', 'Education', 'subscription', 'Cambly', 'seed'),
  ('chegg', 'Chegg', 'Education', 'subscription', 'Chegg', 'seed'),
  ('chegg.com', 'Chegg', 'Education', 'subscription', 'Chegg', 'seed'),
  ('mytutor', 'MyTutor', 'Education', 'subscription', 'MyTutor', 'seed'),
  ('superprof', 'Superprof', 'Education', 'subscription', 'Superprof', 'seed'),
  ('wyzant', 'Wyzant', 'Education', 'subscription', 'Wyzant', 'seed'),
  ('varsity tutors', 'Varsity Tutors', 'Education', 'subscription', 'Varsity Tutors', 'seed'),
  ('kumon', 'Kumon', 'Education', 'subscription', 'Kumon', 'seed'),
  ('mathnasium', 'Mathnasium', 'Education', 'subscription', 'Mathnasium', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- DESIGN / CREATIVE SOFTWARE
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('adobe', 'Adobe', 'Bills & Utilities', 'subscription', 'Adobe Creative Cloud', 'seed'),
  ('adobe.com', 'Adobe', 'Bills & Utilities', 'subscription', 'Adobe Creative Cloud', 'seed'),
  ('adobe creative cloud', 'Adobe', 'Bills & Utilities', 'subscription', 'Adobe Creative Cloud', 'seed'),
  ('canva', 'Canva', 'Bills & Utilities', 'subscription', 'Canva Pro', 'seed'),
  ('canva.com', 'Canva', 'Bills & Utilities', 'subscription', 'Canva Pro', 'seed'),
  ('figma', 'Figma', 'Bills & Utilities', 'subscription', 'Figma', 'seed'),
  ('figma.com', 'Figma', 'Bills & Utilities', 'subscription', 'Figma', 'seed'),
  ('sketch', 'Sketch', 'Bills & Utilities', 'subscription', 'Sketch', 'seed'),
  ('sketch.com', 'Sketch', 'Bills & Utilities', 'subscription', 'Sketch', 'seed'),
  ('invision', 'InVision', 'Bills & Utilities', 'subscription', 'InVision', 'seed'),
  ('procreate', 'Procreate', 'Bills & Utilities', 'general', NULL, 'seed'),
  ('affinity', 'Affinity', 'Bills & Utilities', 'general', NULL, 'seed'),
  ('corel', 'Corel', 'Bills & Utilities', 'subscription', 'Corel', 'seed'),
  ('pixelmator', 'Pixelmator', 'Bills & Utilities', 'general', NULL, 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- FOOD / COFFEE / TEA (specialty)
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source) VALUES
  ('starbucks', 'Starbucks', 'Dining Out', 'restaurant', 'seed'),
  ('starbucks coffee', 'Starbucks', 'Dining Out', 'restaurant', 'seed'),
  ('starbucks.com', 'Starbucks', 'Dining Out', 'restaurant', 'seed'),
  ('costa coffee', 'Costa', 'Dining Out', 'restaurant', 'seed'),
  ('caffe nero', 'Caffè Nero', 'Dining Out', 'restaurant', 'seed'),
  ('pret a manger', 'Pret A Manger', 'Dining Out', 'restaurant', 'seed'),
  ('pret', 'Pret A Manger', 'Dining Out', 'restaurant', 'seed'),
  ('dunkin''', 'Dunkin''', 'Dining Out', 'restaurant', 'seed'),
  ('tim hortons', 'Tim Hortons', 'Dining Out', 'restaurant', 'seed'),
  ('caribou coffee', 'Caribou Coffee', 'Dining Out', 'restaurant', 'seed'),
  ('blue bottle', 'Blue Bottle', 'Dining Out', 'restaurant', 'seed'),
  ('philz coffee', 'Philz Coffee', 'Dining Out', 'restaurant', 'seed'),
  ('intelligentsia', 'Intelligentsia', 'Dining Out', 'restaurant', 'seed'),
  ('peet''s coffee', 'Peet''s', 'Dining Out', 'restaurant', 'seed'),
  ('dutch bros', 'Dutch Bros', 'Dining Out', 'restaurant', 'seed'),
  ('gloria jeans', 'Gloria Jean''s', 'Dining Out', 'restaurant', 'seed'),
  ('joe & the juice', 'Joe & The Juice', 'Dining Out', 'restaurant', 'seed'),
  ('the coffee bean', 'Coffee Bean & Tea Leaf', 'Dining Out', 'restaurant', 'seed'),
  -- Bakeries
  ('greggs', 'Greggs', 'Dining Out', 'restaurant', 'seed'),
  ('panera bread', 'Panera Bread', 'Dining Out', 'restaurant', 'seed'),
  ('panera', 'Panera Bread', 'Dining Out', 'restaurant', 'seed'),
  ('au bon pain', 'Au Bon Pain', 'Dining Out', 'restaurant', 'seed'),
  ('crumbl cookies', 'Crumbl', 'Dining Out', 'restaurant', 'seed'),
  ('insomnia cookies', 'Insomnia Cookies', 'Dining Out', 'restaurant', 'seed'),
  ('paul bakery', 'PAUL', 'Dining Out', 'restaurant', 'seed'),
  ('gail''s bakery', 'GAIL''s', 'Dining Out', 'restaurant', 'seed'),
  -- Ice Cream
  ('baskin robbins', 'Baskin-Robbins', 'Dining Out', 'restaurant', 'seed'),
  ('baskin-robbins', 'Baskin-Robbins', 'Dining Out', 'restaurant', 'seed'),
  ('cold stone creamery', 'Cold Stone', 'Dining Out', 'restaurant', 'seed'),
  ('marble slab', 'Marble Slab', 'Dining Out', 'restaurant', 'seed'),
  ('ben & jerry''s', 'Ben & Jerry''s', 'Dining Out', 'restaurant', 'seed'),
  ('haagen dazs', 'Häagen-Dazs', 'Dining Out', 'restaurant', 'seed'),
  -- Juice / Smoothie
  ('jamba juice', 'Jamba', 'Dining Out', 'restaurant', 'seed'),
  ('juice press', 'Juice Press', 'Dining Out', 'restaurant', 'seed'),
  ('boost juice', 'Boost Juice', 'Dining Out', 'restaurant', 'seed'),
  ('tropical smoothie', 'Tropical Smoothie', 'Dining Out', 'restaurant', 'seed')
ON CONFLICT (alias) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- COMMUNICATION / MESSAGING APPS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, subscription_name, source) VALUES
  ('whatsapp', 'WhatsApp', 'Bills & Utilities', 'general', NULL, 'seed'),
  ('telegram premium', 'Telegram', 'Bills & Utilities', 'subscription', 'Telegram Premium', 'seed'),
  ('signal', 'Signal', 'Bills & Utilities', 'general', NULL, 'seed'),
  ('skype', 'Skype', 'Bills & Utilities', 'subscription', 'Skype', 'seed'),
  ('vonage', 'Vonage', 'Bills & Utilities', 'subscription', 'Vonage', 'seed'),
  ('ringcentral', 'RingCentral', 'Bills & Utilities', 'subscription', 'RingCentral', 'seed'),
  ('grasshopper', 'Grasshopper', 'Bills & Utilities', 'subscription', 'Grasshopper', 'seed'),
  ('ooma', 'Ooma', 'Bills & Utilities', 'subscription', 'Ooma', 'seed')
ON CONFLICT (alias) DO NOTHING;
