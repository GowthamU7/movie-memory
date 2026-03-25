import { GET } from "./route";

jest.mock("@/lib/session", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/services/fact-service", () => ({
  getMovieFactForUser: jest.fn(),
}));

import { getSession } from "../../../lib/session";
import { getMovieFactForUser } from "../../../services/fact-service";

describe("/api/fact authorization", () => {
  it("returns 401 when user is unauthenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns fact data for authenticated user", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1" },
    });

    (getMovieFactForUser as jest.Mock).mockResolvedValue({
      fact: "A fun fact",
      createdAt: "2026-03-23T12:00:00.000Z",
      source: "cache",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.fact).toBe("A fun fact");
    expect(getMovieFactForUser).toHaveBeenCalledWith("user-1");
  });
});