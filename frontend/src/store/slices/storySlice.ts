import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/api";

interface Story {
  id: string;
  type: "chinese" | "korean";
  content: string;
  metadata: {
    initialChoice?: string;
    lastChoice?: string;
    currentChoices: string[];
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoryState = {
  stories: [],
  currentStory: null,
  loading: false,
  error: null,
};

export const fetchMyStories = createAsyncThunk(
  "story/fetchMyStories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Story[]>("/story/my-stories");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stories"
      );
    }
  }
);

export const fetchStory = createAsyncThunk(
  "story/fetchStory",
  async (storyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Story>(`/story/${storyId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch story"
      );
    }
  }
);

export const createStory = createAsyncThunk(
  "story/createStory",
  async (
    { type, userChoice }: { type: "chinese" | "korean"; userChoice: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<Story>("/story/create", {
        type,
        userChoice,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create story"
      );
    }
  }
);

export const continueStory = createAsyncThunk(
  "story/continueStory",
  async (
    { storyId, userChoice }: { storyId: string; userChoice: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<Story>("/story/continue", {
        storyId,
        userChoice,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to continue story"
      );
    }
  }
);

const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    setCurrentStory: (state, action: PayloadAction<Story>) => {
      state.currentStory = action.payload;
    },
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyStories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyStories.fulfilled, (state, action) => {
        state.loading = false;
        state.stories = action.payload;
      })
      .addCase(fetchMyStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStory = action.payload;
      })
      .addCase(fetchStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.loading = false;
        state.stories.push(action.payload);
        state.currentStory = action.payload;
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(continueStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(continueStory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStory = action.payload;

        // Update the story in the stories array
        const index = state.stories.findIndex(
          (story) => story.id === action.payload.id
        );
        if (index !== -1) {
          state.stories[index] = action.payload;
        }
      })
      .addCase(continueStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentStory, clearCurrentStory } = storySlice.actions;
export default storySlice.reducer;
