export type ActionState = {
  ok: boolean
  error: string | null
  message: string | null
  recoveryUrl?: string | null
}
export type FormAction = (
  state: ActionState,
  data: FormData,
) => Promise<ActionState>
export const initialState: ActionState = {
  ok: false,
  error: null,
  message: null,
}
