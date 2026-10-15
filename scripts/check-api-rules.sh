#!/usr/bin/env bash
# Checks what an anonymous (not logged in) visitor can do on the PocketBase API.
#
#   scripts/check-api-rules.sh                 read checks only (safe)
#   scripts/check-api-rules.sh --write-test    also tries to CREATE records (see warning)
#   PB_URL=https://other-host/pb scripts/check-api-rules.sh
#
# WARNING for --write-test: if the rules are still open, this script CREATES real records
# named "RULES-TEST-DELETE-ME" on the server. It prints their ids so you can delete them
# in the PocketBase admin. Only run it when you are ready to clean up.
#
# Result meanings:
#   PASS          behaves as intended
#   FAIL          an anonymous visitor can do something they must not. Fix the rule.
#   INCONCLUSIVE  the server rejected the request for another reason (usually a validation
#                 error), so this cannot prove the rule works. Confirm the rule in the admin
#                 UI (see docs/07-pocketbase-setup.md, section 2).

PB_URL="${PB_URL:-https://jpg-services.nddu.edu.ph/pb-biosoc}"
WRITE_TEST=0
[ "$1" = "--write-test" ] && WRITE_TEST=1

PUBLIC_READ="species details kingdom phylum class order family genus"
FAILS=0

say() { printf "%-13s %s\n" "$1" "$2"; }

code() { # method url [json body]
  curl -s -m 20 -o /tmp/pb_check_body -w '%{http_code}' -X "$1" \
    -H 'Content-Type: application/json' ${3:+-d "$3"} "$2"
}

echo "Checking $PB_URL as an anonymous visitor"
echo

echo "== Public data must be readable =="
for c in $PUBLIC_READ; do
  s=$(code GET "$PB_URL/api/collections/$c/records?perPage=1")
  if [ "$s" = "200" ]; then say PASS "read $c"; else say FAIL "read $c returned $s"; FAILS=$((FAILS+1)); fi
done

echo
echo "== User accounts must not be listable =="
s=$(code GET "$PB_URL/api/collections/users/records?perPage=1")
if [ "$s" = "200" ] && grep -q '"totalItems":0' /tmp/pb_check_body; then
  say PASS "users list returns no rows"
elif [ "$s" = "200" ]; then
  say FAIL "users list returns rows to anonymous visitors"; FAILS=$((FAILS+1))
else
  say PASS "users list refused ($s)"
fi

echo
echo "== Anonymous update/delete (made-up id) =="
for c in $PUBLIC_READ; do
  for m in PATCH DELETE; do
    s=$(code $m "$PB_URL/api/collections/$c/records/aaaaaaaaaaaaaaa" '{}')
    case "$s" in
      200|204) say FAIL "$m $c succeeded for a visitor"; FAILS=$((FAILS+1)) ;;
      401|403) say PASS "$m $c refused ($s)" ;;
      *)       say INCONCLUSIVE "$m $c returned $s (the id does not exist; check the rule in the admin UI)" ;;
    esac
  done
done

if [ "$WRITE_TEST" = "1" ]; then
  echo
  echo "== Anonymous create =="
  for c in $PUBLIC_READ; do
    s=$(code POST "$PB_URL/api/collections/$c/records" '{"name":"RULES-TEST-DELETE-ME"}')
    case "$s" in
      200|201)
        id=$(grep -o '"id":"[a-z0-9]*"' /tmp/pb_check_body | head -1)
        say FAIL "create $c succeeded for a visitor, delete record $id"; FAILS=$((FAILS+1)) ;;
      401|403) say PASS "create $c refused ($s)" ;;
      *)       say INCONCLUSIVE "create $c returned $s (validation error; check the rule in the admin UI)" ;;
    esac
  done
else
  echo
  echo "(create checks skipped; pass --write-test to include them)"
fi

rm -f /tmp/pb_check_body
echo
if [ "$FAILS" -eq 0 ]; then echo "No failures."; else echo "$FAILS failure(s). Fix the rules and run again."; fi
exit $([ "$FAILS" -eq 0 ] && echo 0 || echo 1)
