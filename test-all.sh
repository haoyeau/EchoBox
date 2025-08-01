#!/bin/bash

# Test runner script for EchoBox
# This script runs both client and server tests

echo "🧪 Running EchoBox Test Suite"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
CLIENT_RESULT=0
SERVER_RESULT=0

echo ""
echo -e "${YELLOW}📱 Running Client Tests...${NC}"
echo "----------------------------------------"
cd client
npm test -- --watchAll=false --coverage 2>/dev/null
CLIENT_RESULT=$?

echo ""
echo -e "${YELLOW}🖥️  Running Server Tests...${NC}"
echo "----------------------------------------"
cd ../server
npm test 2>/dev/null
SERVER_RESULT=$?

echo ""
echo "=============================="
echo "🏁 Test Results Summary"
echo "=============================="

if [ $CLIENT_RESULT -eq 0 ]; then
    echo -e "Client Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Client Tests: ${RED}❌ FAILED${NC}"
fi

if [ $SERVER_RESULT -eq 0 ]; then
    echo -e "Server Tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Server Tests: ${RED}❌ FAILED${NC}"
fi

echo ""
if [ $CLIENT_RESULT -eq 0 ] && [ $SERVER_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 Some tests failed!${NC}"
    exit 1
fi
