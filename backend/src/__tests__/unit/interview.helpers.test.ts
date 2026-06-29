import { determineStage } from "../../services/ai/stageManager.js";
import { parseSummaryList, getScore } from "../../controllers/interview.controller.js";

describe("Interview Helpers", () => {
  describe("determineStage", () => {
    it("should return greeting for 0 messages", () => {
      expect(determineStage(0)).toBe("greeting");
    });
    it("should return warmup for 1-4 messages", () => {
      expect(determineStage(2)).toBe("warmup");
    });
    it("should return design for 5-10 messages", () => {
      expect(determineStage(7)).toBe("design");
    });
    it("should return deep_dive for 11-20 messages", () => {
      expect(determineStage(15)).toBe("deep_dive");
    });
    it("should return evaluation for >20 messages", () => {
      expect(determineStage(25)).toBe("evaluation");
    });
  });

  describe("getScore", () => {
    it("should return good for 0 or 1 missed topics", () => {
      expect(getScore(0)).toBe("good");
      expect(getScore(1)).toBe("good");
    });
    it("should return average for 2 or 3 missed topics", () => {
      expect(getScore(2)).toBe("average");
      expect(getScore(3)).toBe("average");
    });
    it("should return needs_improvement for >3 missed topics", () => {
      expect(getScore(4)).toBe("needs_improvement");
      expect(getScore(5)).toBe("needs_improvement");
    });
  });

  describe("parseSummaryList", () => {
    it("should return empty array for null/undefined", () => {
      expect(parseSummaryList(null)).toEqual([]);
      expect(parseSummaryList(undefined)).toEqual([]);
    });
    it("should parse valid JSON array of strings", () => {
      expect(parseSummaryList('["a","b"]')).toEqual(["a", "b"]);
    });
    it("should return empty array for invalid JSON", () => {
      expect(parseSummaryList('not json')).toEqual([]);
    });
    it("should filter non-strings in parsed array", () => {
      expect(parseSummaryList('["a", 1, "b", null]')).toEqual(["a", "b"]);
    });
    it("should return empty array if JSON is not an array", () => {
      expect(parseSummaryList('{"a":1}')).toEqual([]);
    });
  });
});
