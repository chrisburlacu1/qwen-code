#!/bin/bash

# migrate_gemini_to_sosh.sh
# Usage: ./migrate_gemini_to_sosh.sh <repo_url> [optional_target_directory_name]

set -e

# Colors for SOSH branding
PINK='\033[1;95m'
PURPLE='\033[0;35m'
CYAN='\033[1;96m'
NC='\033[0m' # No Color

# Target directory for all extensions
EXTENSIONS_DIR="../extensions"

# Ensure the directory exists and switch to it
if [ ! -d "$EXTENSIONS_DIR" ]; then
    mkdir -p "$EXTENSIONS_DIR"
fi
cd "$EXTENSIONS_DIR" || { echo "Failed to cd to $EXTENSIONS_DIR"; exit 1; }

REPO_URL=$1
TARGET_DIR_NAME=$2

if [ -z "$REPO_URL" ]; then
  echo -e "${PINK}Error: Repository URL is required.${NC}"
  echo -e "${CYAN}Usage: $0 <repo_url> [optional_target_directory_name]${NC}"
  exit 1
fi

# Extract repo name if target dir not provided
if [ -z "$TARGET_DIR_NAME" ]; then
  BASENAME=$(basename "$REPO_URL" .git)
  TARGET_DIR_NAME="${BASENAME/gemini/sosh}"
  # Ensure it doesn't just stay the same if "gemini" wasn't in the name, 
  # though usually these repos might be named "gemini-extension-foo"
  if [ "$TARGET_DIR_NAME" == "$BASENAME" ]; then
      TARGET_DIR_NAME="sosh-${BASENAME}"
  fi
fi

echo -e "${PINK}Cloning $REPO_URL into $TARGET_DIR_NAME...${NC}"
git clone "$REPO_URL" "$TARGET_DIR_NAME"
cd "$TARGET_DIR_NAME"

echo -e "${PURPLE}Removing .git directory to verify independent repo...${NC}"
rm -rf .git

echo -e "${PURPLE}Renaming files and directories...${NC}"
# Depth-first rename to handle nested directories correctly
# We use 'find' to get list, then sort by length desc to rename deepest children first
find . -depth -name "*gemini*" | while read -r FILE; do
  NEW_FILE="${FILE//gemini/sosh}"
  echo "Renaming '$FILE' to '$NEW_FILE'"
  mv "$FILE" "$NEW_FILE"
done



echo -e "${CYAN}Attempting to link extension...${NC}"
if command -v sosh &> /dev/null; then
    PWD=$(pwd)
    echo "Running: sosh extensions link \"$PWD\""
    NODE_OPTIONS='--no-deprecation' sosh extensions link "$PWD"
else
    echo "Warning: 'sosh' command not found. Please run 'sosh extension link \"$(pwd)\"' manually."
fi

echo -e "${PINK}Migration complete!${NC}"
