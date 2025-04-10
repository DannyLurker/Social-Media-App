import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface authState {
  user: User | null;
}

const initialState: authState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setAuthUser } = authSlice.actions;
export default authSlice.reducer;
