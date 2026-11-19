import { contentTypeOf } from "@shared/lib/mime";
import {
  centreSquare,
  fitLongEdge,
  prepareImage,
} from "@shared/lib/prepareImage";

type MockContext = {
  crop: jest.Mock;
  resize: jest.Mock;
  renderAsync: jest.Mock;
};

const mockContexts: MockContext[] = [];

jest.mock("expo-image-manipulator", () => {
  const original = { width: 4032, height: 3024, release: jest.fn() };
  const image = {
    release: jest.fn(),
    saveAsync: jest.fn(async () => ({
      uri: "file:///cache/out.jpg",
      width: 512,
      height: 512,
    })),
  };
  return {
    SaveFormat: { JPEG: "jpeg", PNG: "png", WEBP: "webp" },
    ImageManipulator: {
      manipulate: jest.fn(() => {
        const context: MockContext = {
          crop: jest.fn((): MockContext => context),
          resize: jest.fn((): MockContext => context),
          // The first context renders the original, the second the result.
          renderAsync: jest.fn(async () =>
            mockContexts.length === 1 ? original : image,
          ),
        };
        mockContexts.push(context);
        return context;
      }),
    },
  };
});

describe("contentTypeOf", () => {
  it("trusts a specific type the picker reported", () => {
    expect(contentTypeOf("scan", "application/pdf")).toBe("application/pdf");
  });

  it("drops a charset the picker added", () => {
    expect(contentTypeOf("notes.txt", "text/plain; charset=utf-8")).toBe(
      "text/plain",
    );
  });

  it("works it out from the extension when Android says octet-stream", () => {
    expect(contentTypeOf("Timetable.PDF", "application/octet-stream")).toBe(
      "application/pdf",
    );
    expect(contentTypeOf("IMG_0001.HEIC")).toBe("image/heic");
  });

  it("is undefined when nothing says what it is", () => {
    expect(contentTypeOf("archive.xyz")).toBeUndefined();
  });
});

describe("centreSquare", () => {
  it("takes the middle of a landscape photo", () => {
    expect(centreSquare(4032, 3024)).toEqual({
      originX: 504,
      originY: 0,
      width: 3024,
      height: 3024,
    });
  });

  it("takes the middle of a portrait photo", () => {
    expect(centreSquare(3024, 4032)).toEqual({
      originX: 0,
      originY: 504,
      width: 3024,
      height: 3024,
    });
  });
});

describe("fitLongEdge", () => {
  it("leaves a photo that already fits", () => {
    expect(fitLongEdge(1920, 1080, 2560)).toBeNull();
  });

  it("scales by the long edge, keeping the ratio", () => {
    expect(fitLongEdge(4032, 3024, 2560)).toEqual({
      width: 2560,
      height: null,
    });
    expect(fitLongEdge(3024, 4032, 2560)).toEqual({
      width: null,
      height: 2560,
    });
  });
});

describe("prepareImage", () => {
  beforeEach(() => {
    mockContexts.length = 0;
  });

  it("crops an avatar to the centre square at 512×512, as a JPEG", async () => {
    const prepared = await prepareImage("file:///photo.heic", "avatar");

    const edit = mockContexts[1]!;
    expect(edit.crop).toHaveBeenCalledWith({
      originX: 504,
      originY: 0,
      width: 3024,
      height: 3024,
    });
    expect(edit.resize).toHaveBeenCalledWith({ width: 512, height: 512 });
    expect(prepared).toEqual({
      uri: "file:///cache/out.jpg",
      contentType: "image/jpeg",
      width: 512,
      height: 512,
    });
  });

  it("brings an attachment's long edge down to 2560, without cropping", async () => {
    await prepareImage("file:///photo.heic", "attachment");

    const edit = mockContexts[1]!;
    expect(edit.crop).not.toHaveBeenCalled();
    expect(edit.resize).toHaveBeenCalledWith({ width: 2560, height: null });
  });
});
