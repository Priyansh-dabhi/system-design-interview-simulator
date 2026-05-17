import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type problemState = {
  selectedTopic: {
    id: string;
    title: string;
  } | null;
};

const initialState: problemState = {
  selectedTopic: null,
};

const problemSlice = createSlice({
  name: 'problem',
  initialState,
  reducers: {
    setSelectedTopic: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      state.selectedTopic = action.payload;
    },
    clearSelectedTopic: (state) => {
      state.selectedTopic = null;
    },
  },
});

export const { setSelectedTopic, clearSelectedTopic } =
  problemSlice.actions;

export default problemSlice.reducer;
