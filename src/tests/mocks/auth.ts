export const mockSyncAuth = jest.fn().mockResolvedValue(undefined);

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ syncAuth: mockSyncAuth }),
}));
