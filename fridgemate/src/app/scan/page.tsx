export default function ScanPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="text-2xl font-semibold">拍照上传</h1>
      <p
        className="mt-4 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        毛郡仪负责。识别完成后调用{" "}
        <code>useFridgeStore().addItems([...])</code> 同步到首页库存。
      </p>
    </main>
  );
}
