// Validation test for Sandcastle + OpenCode + Fireworks
// This runs a simple one-iteration test to verify the setup works

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

console.log("🧪 Testing Sandcastle + OpenCode + Fireworks configuration...\n");

// Test 1: Verify environment variables are set
console.log("✓ Environment check:");
console.log("  FIREWORKS_API_KEY:", process.env.FIREWORKS_API_KEY ? "✅ Set" : "❌ Not set");
console.log("  GH_TOKEN:", process.env.GH_TOKEN ? "✅ Set" : "❌ Not set");

// Test 2: Run a simple validation prompt
console.log("\n🤖 Running validation test with Fireworks model...");

try {
  const result = await sandcastle.run({
    sandbox: docker(),
    name: "validation-test",
    maxIterations: 1,
    agent: sandcastle.opencode("fireworks-ai/accounts/fireworks/routers/kimi-k2p5-turbo"),
    prompt: `Respond with exactly: "Sandcastle + OpenCode + Fireworks is working!"`,
  });

  console.log("\n✅ Validation test completed successfully!");
  console.log("\n📤 Agent response:");
  console.log(result.stdout);
  
  if (result.stdout.includes("working")) {
    console.log("\n🎉 SUCCESS: Sandcastle is properly configured with OpenCode and Fireworks!");
    process.exit(0);
  } else {
    console.log("\n⚠️  WARNING: Agent ran but response was unexpected");
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ Validation test failed:");
  console.error(error);
  process.exit(1);
}
