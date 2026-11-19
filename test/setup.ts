// Several legacy date tests assert IST wall-clock output. Pin the zone so the suite is
// deterministic on any developer machine or CI runner (Node applies TZ changes at runtime).
process.env.TZ = "Asia/Kolkata"
