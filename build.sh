# !/bin/bash

if [ "$CF_PAGES_BRANCH" == "main" ]; then
  # Run the "production" script in `package.json` on the "production" branch
  # "production" should be replaced with the name of your Production branch

  pnpm run build:production

elif [ "$CF_PAGES_BRANCH" == "preview" ]; then
  # Run the "staging" script in `package.json` on the "staging" branch
  # "staging" should be replaced with the name of your specific branch

  pnpm run build:production

else
  # Else run the dev script
  pnpm run build:testing
fi
