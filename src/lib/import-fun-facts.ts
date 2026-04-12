export const IMPORT_FUN_FACTS: readonly string[] = [
  "The 50/30/20 rule suggests 50% on needs, 30% on wants, and 20% on savings.",
  "Compound interest was called the eighth wonder of the world by Einstein... probably.",
  "The average person makes 35,000 decisions per day — budgeting helps automate the money ones.",
  "A penny doubled every day for 30 days becomes over £5 million.",
  "The word 'budget' comes from the French 'bougette', meaning a small leather bag.",
  "People who track their spending save on average 20% more than those who don't.",
  "The first banknotes were used in China during the Tang Dynasty, around 618 AD.",
  "Octopuses have three hearts, blue blood, and no student loans.",
  "Paying yourself first is the #1 habit of financially successful people.",
  "Honey never spoils — archaeologists found 3,000-year-old honey that was still edible.",
  "Setting up automatic savings transfers can boost your savings rate by up to 73%.",
  "Bananas are berries, but strawberries aren't. Finance is less confusing than botany.",
  "The average UK household spends £60/month on subscriptions they've forgotten about.",
  "A group of flamingos is called a 'flamboyance'. Your budget can be flamboyant too.",
  "Round-up savings can add up to £500+ per year without you even noticing.",
  "Cows have best friends and get stressed when separated. We're just importing your data.",
  "The 72 Rule: divide 72 by your interest rate to estimate how long it takes to double your money.",
  "Sloths can hold their breath longer than dolphins — up to 40 minutes.",
  "Reviewing subscriptions quarterly can save the average person £240 per year.",
  "The longest English word without a vowel is 'rhythms'. The longest wait is for bank imports.",
  "Emergency funds covering 3–6 months of expenses protect against 95% of financial shocks.",
  "Scotland's national animal is the unicorn. Your bank balance doesn't have to be mythical.",
  "People who write down their financial goals are 42% more likely to achieve them.",
  "The shortest war in history lasted 38 minutes. This import won't take quite that long.",
  "Automating bill payments eliminates late fees, which cost the average person £150/year.",
] as const;

export function getRandomFact(): string {
  return IMPORT_FUN_FACTS[Math.floor(Math.random() * IMPORT_FUN_FACTS.length)];
}
