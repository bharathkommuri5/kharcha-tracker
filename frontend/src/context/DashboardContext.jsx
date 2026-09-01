import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api, { apiErrorMessage } from "../lib/api.js";
import { currentMonthRange, monthRange, shiftMonth } from "../lib/month.js";
import { useToast } from "./ToastContext.jsx";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const toast = useToast();
  const [cursor, setCursor] = useState(() => {
    const r = currentMonthRange();
    return { year: r.year, month: r.month };
  });
  const range = useMemo(() => monthRange(cursor.year, cursor.month), [cursor]);

  const [options, setOptions] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reqId = useRef(0);

  // options are static for the session
  useEffect(() => {
    api
      .get("/config/options")
      .then((res) => setOptions(res.data))
      .catch((e) => toast.error(apiErrorMessage(e, "Could not load options")));
  }, [toast]);

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const [tx, sum] = await Promise.all([
        api.get("/transactions", { params: { start: range.start, end: range.end } }),
        api.get("/analytics/summary", { params: { start: range.start, end: range.end } }),
      ]);
      if (id !== reqId.current) return; // a newer request superseded this one
      setTransactions(tx.data);
      setSummary(sum.data);
    } catch (e) {
      if (id !== reqId.current) return;
      setError(apiErrorMessage(e, "Could not load your expenses"));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    load();
  }, [load]);

  const goToMonth = useCallback((delta) => {
    setCursor((c) => shiftMonth(c.year, c.month, delta));
  }, []);

  const addTransaction = useCallback(
    async (payload) => {
      await api.post("/transactions", payload);
      toast.success("Expense added");
      await load();
    },
    [load, toast]
  );

  const updateTransaction = useCallback(
    async (id, payload) => {
      await api.patch(`/transactions/${id}`, payload);
      toast.success("Expense updated");
      await load();
    },
    [load, toast]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      await api.delete(`/transactions/${id}`);
      toast.success("Expense deleted");
      await load();
    },
    [load, toast]
  );

  const sendReport = useCallback(async (start, end) => {
    const res = await api.post("/reports/email", { start, end });
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      range,
      options,
      transactions,
      summary,
      loading,
      error,
      refresh: load,
      goToMonth,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      sendReport,
    }),
    [
      range,
      options,
      transactions,
      summary,
      loading,
      error,
      load,
      goToMonth,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      sendReport,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
