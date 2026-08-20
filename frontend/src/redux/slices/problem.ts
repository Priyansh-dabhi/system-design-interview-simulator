import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type problemState = {
  selectedTopic: {
    id: string;
    title: string;
  } | null;
  durationMinutes: number;
  difficultyLevel: 'junior' | 'mid' | 'senior';
};

const initialState: problemState = {
  selectedTopic: null,
  durationMinutes: 30,
  difficultyLevel: 'mid',
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
    setDuration: (state, action: PayloadAction<number>) => {
      state.durationMinutes = action.payload;
    },
    setDifficulty: (state, action: PayloadAction<'junior' | 'mid' | 'senior'>) => {
      state.difficultyLevel = action.payload;
    },
  },
});

export const { setSelectedTopic, clearSelectedTopic, setDuration, setDifficulty } =
  problemSlice.actions;

export default problemSlice.reducer;
