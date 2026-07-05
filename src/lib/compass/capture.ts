// 결과 화면 캡쳐 — modern-screenshot(domToPng)로 DOM을 PNG로 저장.
//
// Tailwind v4는 색상을 oklch()로 내보내는데, html2canvas(1.4.1)는 oklch를 못 읽어
// 색이 깨진다. modern-screenshot은 최신 CSS(oklch 포함)를 지원해 안정적이다.
import { domToPng } from "modern-screenshot";

/**
 * 주어진 노드를 PNG로 캡쳐해 다운로드한다.
 * @param node 캡쳐할 DOM 요소
 * @param filename 저장 파일명
 * @param backgroundColor 배경색(투명 방지)
 */
export async function saveNodeAsImage(
  node: HTMLElement,
  filename = "나침반_결과.png",
  backgroundColor = "#ffffff",
): Promise<void> {
  const dataUrl = await domToPng(node, {
    scale: 2,
    backgroundColor,
    quality: 1,
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
