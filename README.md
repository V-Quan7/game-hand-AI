# ENERGY ROBOT — Version 5

Phiên bản 5 có vòng chơi liên tục: một pin bay chậm qua lại ở nửa trái sân chơi; người chơi nhặt pin và mang sang robot bên phải. Mỗi pin nạp 20%, cộng 100 điểm. Khi đủ 100%, người chơi trỏ vào đáp án If–Then và nắm tay xác nhận. Đúng thì robot sáng và bắt đầu lượt nạp mới; sai thì mất toàn bộ điểm và chơi lại từ đầu.

## Cấu trúc thư mục

```text
ENERGY-ROBOT/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── camera.js
│   ├── audio.js
│   ├── battery.js
│   ├── collision.js
│   ├── effects.js
│   ├── gestureRecognition.js
│   ├── gameEngine.js
│   ├── handController.js
│   ├── handTracking.js
│   ├── effects.js
│   ├── robot.js
│   └── ui.js
└── README.md
```

## Yêu cầu

- Google Chrome phiên bản mới.
- Webcam hoạt động và quyền truy cập camera được cấp.
- Kết nối Internet lần đầu để tải thư viện MediaPipe, WebAssembly và mô hình nhận diện.
- Chạy trang trên `localhost` hoặc HTTPS. Trình duyệt thường chặn webcam khi mở trực tiếp bằng `file://`.

## Cách chạy bằng VS Code Live Server

1. Mở thư mục dự án trong VS Code.
2. Cài extension **Live Server** nếu máy chưa có.
3. Mở `index.html`, chọn **Open with Live Server**.
4. Trong Chrome, nhấn **START GAME** hoặc **BẬT WEBCAM** và cho phép truy cập camera.
5. Đưa một bàn tay vào khung hình. Di chuyển vòng sáng đến gần pin, nắm tay để nhặt và giữ pin theo con trỏ.
6. Di chuyển pin đến vùng phát sáng của robot; xòe tay để nạp thêm 20%. Lặp lại năm lần để nạp đủ 100%.
7. Khi câu hỏi If–Then xuất hiện, trỏ tâm lòng bàn tay vào đáp án rồi nắm tay để xác nhận. Trả lời đúng làm robot sáng và mở lượt nạp mới; trả lời sai đặt điểm và robot về 0.

Mô hình thử khởi tạo bằng GPU trước, sau đó tự chuyển sang CPU nếu GPU không khả dụng. Nếu webcam hoặc tải mô hình thất bại, thông báo lỗi được hiển thị trên trang; kiểm tra quyền camera, kết nối mạng và tải lại trang sau khi khắc phục.

## Điều khiển và trạng thái

- **START GAME / BẬT WEBCAM:** tải mô hình một lần, bật camera và bắt đầu nhận diện.
- **TẠM DỪNG AI:** dừng nhận diện nhưng vẫn giữ webcam hoạt động.
- **TIẾP TỤC AI:** tiếp tục nhận diện.
- **CHƠI LẠI:** đặt lại trạng thái nhận diện mà không khởi tạo lại mô hình.
- Pin bay qua lại chậm ở nửa trái sân chơi; robot nằm bên phải.
- Mỗi pin được thả vào vùng nhận cộng 20% năng lượng và 100 điểm. Câu hỏi chỉ hiện khi năng lượng đạt 100%.
- Độ sáng thân, mắt, lõi và đường viền robot tăng theo các mốc năng lượng; robot chỉ hiện ACTIVE khi đầy 100%.
- Khi câu hỏi hiện ra, di chuyển tâm lòng bàn tay vào đáp án muốn chọn rồi nắm tay ổn định để xác nhận; trò chơi hiện kết quả rồi tiếp tục vòng pin kế tiếp.
- Âm thanh dùng Web Audio API, được mở khóa sau thao tác bấm của người dùng; nếu trình duyệt không hỗ trợ, trò chơi vẫn chạy và nút âm thanh hiển thị trạng thái tắt.
- Hiệu ứng hạt được giới hạn số lượng, tự dừng vòng lặp khi hết hiệu ứng và tôn trọng cài đặt giảm chuyển động của hệ điều hành.
- AI giới hạn tối đa 30 FPS; nếu thời gian nhận diện chậm liên tục, tự giảm mục tiêu xuống 20 FPS và trở lại 30 FPS khi hiệu năng ổn định.
- Pin xuất hiện ngẫu nhiên ở nửa trái sân chơi và tự bay qua lại; chỉ nhặt được khi con trỏ chạm pin và cử chỉ nắm tay đã được xác nhận.
- Giữ nắm tay để mang pin theo con trỏ; xòe tay đã xác nhận để thả. Pin thả ngoài vùng robot có thể được nhặt lại.
- Chỉ khi pin được giữ trong vùng nhận của robot và người chơi xòe tay thì pin mới được nạp thêm 20%. Robot chỉ sáng sau khi trả lời đúng câu hỏi ở mức 100%.
- Nút chơi lại đặt lại điểm, bộ đếm và pin về trạng thái ban đầu.
- Nếu không thấy bàn tay, pin không tự nhặt hoặc thả; pin đang giữ được giữ nguyên vị trí đến khi nhận diện lại.
- Con trỏ ảo dùng tâm lòng bàn tay (trung bình landmark 0, 5, 9, 13, 17), lật trục X theo gương, làm mượt bằng EMA và được giới hạn trong khung camera.
- Hành động với `Open_Palm` hoặc `Closed_Fist` dùng ngưỡng tin cậy 55% và phải ổn định ít nhất 4 khung hình liên tiếp. Cử chỉ xòe được hỗ trợ thêm bằng kiểm tra hình học các ngón tay từ 21 landmarks.
- Để nhận diện xòe tay tốt hơn, hướng lòng bàn tay về camera, để đủ các ngón trong khung hình và dùng ánh sáng đủ rõ.
- Khi không thấy bàn tay, trạng thái chuyển ngay thành `No Hand`; không giữ lại cử chỉ trước đó.
- Giới hạn tối đa một bàn tay, webcam yêu cầu 640 × 480 và tối đa 30 FPS.

## Kiểm tra nhanh

- Mở trang bằng Live Server và xác nhận pin xuất hiện bên trái, bay chậm qua lại.
- Bật webcam: video, khung xương 21 điểm, dấu phát sáng ở tâm lòng bàn tay, trạng thái AI, độ tin cậy và FPS xuất hiện.
- Đưa con trỏ ra xa pin rồi nắm tay: pin không được nhặt.
- Đưa con trỏ sát pin rồi nắm tay ổn định: pin gắn theo con trỏ.
- Xòe tay ổn định: pin được thả tại chỗ; nắm tay trở lại gần pin để nhặt lại.
- Đưa tay ra khỏi khung hình khi đang giữ pin: pin phải giữ nguyên, không tự thả.
- Nhặt pin, đưa vào vùng nhận bên phải rồi xòe tay: năng lượng tăng 20% mỗi pin; năm pin sẽ mở câu hỏi.
- Đặt pin ngoài vùng nhận rồi xòe: robot vẫn OFF; chơi lại đặt lại cả pin lẫn robot.
- Mỗi pin: +20% năng lượng và +100 điểm. Khi đạt 100%, trả lời đúng bật sáng robot; trả lời sai đặt điểm, pin đã nạp và robot về trạng thái ban đầu.
- Câu trả lời được phản hồi bằng hiệu ứng xanh có dấu ✓ hoặc đỏ có dấu ✕; đáp án đúng không bị tiết lộ khi chọn sai.
- Kiểm tra nút bật/tắt âm thanh và hiệu ứng nạp; khi tắt tiếng, logic trò chơi vẫn hoạt động.
- Thử tạm dừng, tiếp tục, chơi lại và tắt webcam.
