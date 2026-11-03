# ENERGY ROBOT — Version 5

ENERGY ROBOT có hai chế độ chơi. Sau khi kích hoạt, trỏ bàn tay vào chế độ muốn chơi rồi nắm tay để xác nhận. Chế độ Dễ gồm năm tình huống học lập trình: nhặt khối lệnh phù hợp (IF THEN hoặc IF THEN ELSE) trong số bốn khối đang rơi và đưa vào robot. Các khối WAIT và REPEAT xuất hiện làm phương án gây nhiễu. Chế độ Siêu khó yêu cầu nhặt kiếm, chạm kiếm vào năm pin rơi (bốn pin cùng xuất hiện với tốc độ khác nhau), đưa kiếm đã nạp đến robot rồi trả lời đúng năm câu hỏi liên tiếp.

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
5. Đưa một bàn tay vào lõi năng lượng giữa sân chơi và giữ nắm tay ba giây để mở màn chọn chế độ.
6. Trỏ tâm lòng bàn tay vào **DỄ** hoặc **SIÊU KHÓ**, rồi nắm tay để xác nhận.
7. Ở chế độ Dễ, đọc tình huống và câu hỏi trên đầu sân chơi, nắm tay để nhặt khối lệnh đang rơi rồi xòe tay trong vùng robot để kiểm tra. Chọn sai không mất điểm và có thể thử lại; trả lời đúng cả năm tình huống để hoàn thành.
8. Ở chế độ Siêu khó, nắm tay trên kiếm để nhặt; kiếm giữ thẳng đứng với lưỡi hướng lên. Đưa mũi kiếm chạm bốn pin đang rơi. Chạm đủ năm pin, đưa kiếm đến vùng nhận của robot rồi xòe tay; trả lời đúng cả năm câu hỏi để hoàn thành thử thách.

Mô hình thử khởi tạo bằng GPU trước, sau đó tự chuyển sang CPU nếu GPU không khả dụng. Nếu webcam hoặc tải mô hình thất bại, thông báo lỗi được hiển thị trên trang; kiểm tra quyền camera, kết nối mạng và tải lại trang sau khi khắc phục.

## Điều khiển và trạng thái

- **START GAME / BẬT WEBCAM:** tải mô hình một lần, bật camera và bắt đầu nhận diện.
- **TẠM DỪNG AI:** dừng nhận diện nhưng vẫn giữ webcam hoạt động.
- **TIẾP TỤC AI:** tiếp tục nhận diện.
- **CHƠI LẠI:** đặt lại trạng thái nhận diện mà không khởi tạo lại mô hình.
- Bố cục màn chơi trên máy tính: HUD bên trái, camera/sân chơi ở giữa và năm nút điều khiển cùng thông báo ở cột bên phải. Toàn màn hình giữ bố cục này; trên màn hình nhỏ các khu vực tự xếp lại để vừa khung.
- **Chế độ Dễ:** năm tình huống robot lần lượt xuất hiện. Mỗi lượt có bốn khối lệnh dùng ảnh trong `assets/images`: IF THEN, IF THEN ELSE, WAIT và REPEAT. Khối đúng được đưa vào robot để khắc phục tình huống, cộng 100 điểm; khối sai phát hiệu ứng đỏ trong 2 giây và không mất điểm. Hoàn thành năm câu được tối đa 500 điểm.
- **Chế độ Siêu khó:** nắm tay trên kiếm để nhặt; kiếm giữ thẳng đứng, lưỡi hướng lên và không xoay theo góc bàn tay. Bốn pin rơi đồng thời ở các làn và tốc độ khác nhau; đưa mũi kiếm chạm pin để nạp kiếm, đủ năm lần thì xòe tay trong vùng nhận để giao kiếm. Trả lời đúng năm câu hỏi liên tiếp để hoàn thành; trả lời sai sẽ khởi động lại thử thách.
- Trong màn chọn chế độ, trỏ vào lựa chọn để làm nổi bật rồi nắm tay để xác nhận. Có thể nhấn nút chế độ bằng chuột hoặc bàn phím.
- Độ sáng thân, mắt, lõi và đường viền robot tăng theo các mốc năng lượng; robot chỉ hiện ACTIVE khi đầy 100%.
- Khi chơi Dễ, nắm tay trên khối lệnh để nhặt và xòe tay trong vùng nhận của robot để trả lời; phản hồi đúng/sai được hiển thị trong 2 giây.
- Khi chơi Siêu khó, di chuyển tâm lòng bàn tay vào đáp án muốn chọn rồi nắm tay ổn định để xác nhận.
- Âm thanh dùng Web Audio API, được mở khóa sau thao tác bấm của người dùng; nếu trình duyệt không hỗ trợ, trò chơi vẫn chạy và nút âm thanh hiển thị trạng thái tắt.
- Hiệu ứng hạt được giới hạn số lượng, tự dừng vòng lặp khi hết hiệu ứng và tôn trọng cài đặt giảm chuyển động của hệ điều hành.
- AI giới hạn tối đa 30 FPS; nếu thời gian nhận diện chậm liên tục, tự giảm mục tiêu xuống 20 FPS và trở lại 30 FPS khi hiệu năng ổn định.
- **Chế độ Dễ:** mỗi câu có bốn khối lệnh rơi chậm với tốc độ hơi khác nhau; cả bốn ảnh trong `assets/images` đều được dùng. Chỉ IF THEN hoặc IF THEN ELSE phù hợp với tình huống mới được tính đúng.
- Giữ nắm tay để mang khối lệnh theo con trỏ; xòe tay trong vùng robot để nộp. Thả ngoài vùng nhận không nộp đáp án; khối lệnh vẫn có thể được nhặt lại.
- Chọn đúng cộng 100 điểm và hiển thị hiệu ứng xanh cùng hành động của robot trong 2 giây. Chọn sai hiển thị hiệu ứng đỏ trong 2 giây, không trừ điểm và giữ nguyên câu hỏi.
- Nút chơi lại đặt lại điểm, bộ đếm và pin về trạng thái ban đầu.
- Nếu không thấy bàn tay, pin không tự nhặt hoặc thả; pin đang giữ được giữ nguyên vị trí đến khi nhận diện lại.
- Con trỏ ảo dùng tâm lòng bàn tay (trung bình landmark 0, 5, 9, 13, 17), lật trục X theo gương, làm mượt bằng EMA và được giới hạn trong khung camera.
- Hành động với `Open_Palm` hoặc `Closed_Fist` dùng ngưỡng tin cậy 55% và phải ổn định ít nhất 4 khung hình liên tiếp. Cử chỉ xòe được hỗ trợ thêm bằng kiểm tra hình học các ngón tay từ 21 landmarks.
- Để nhận diện xòe tay tốt hơn, hướng lòng bàn tay về camera, để đủ các ngón trong khung hình và dùng ánh sáng đủ rõ.
- Khi không thấy bàn tay, trạng thái chuyển ngay thành `No Hand`; không giữ lại cử chỉ trước đó.
- Giới hạn tối đa một bàn tay, webcam yêu cầu 640 × 480 và tối đa 30 FPS.

## Kiểm tra nhanh

- Mở trang bằng Live Server và xác nhận chế độ Dễ hiện tình huống, câu hỏi, tiến trình 1/5 và bốn khối lệnh rơi.
- Bật webcam: video, khung xương 21 điểm, dấu phát sáng ở tâm lòng bàn tay, trạng thái AI, độ tin cậy và FPS xuất hiện.
- Đưa con trỏ ra xa pin rồi nắm tay: pin không được nhặt.
- Đưa con trỏ sát pin rồi nắm tay ổn định: pin gắn theo con trỏ.
- Xòe tay ổn định: pin được thả tại chỗ; nắm tay trở lại gần pin để nhặt lại.
- Đưa tay ra khỏi khung hình khi đang giữ pin: pin phải giữ nguyên, không tự thả.
- **Chế độ Dễ:** thử nộp sai và đúng; câu trả lời sai không trừ điểm/không chuyển câu, còn đáp án đúng cộng 100 điểm, hiển thị hiệu ứng xanh và sang câu tiếp theo sau 2 giây.
- Màn chọn chế độ: trỏ vào từng lựa chọn để kiểm tra vùng làm nổi bật, sau đó nắm tay để bắt đầu chế độ đó.
- **Chế độ Siêu khó:** xác nhận có bốn pin rơi cùng lúc với tốc độ khác nhau; nhặt kiếm và đưa mũi kiếm chạm pin để tăng tiến trình đến 5/5.
- Giao kiếm đã nạp vào robot bằng cách xòe tay trong vùng nhận; hoàn thành năm câu hỏi để giải cứu robot, trả lời sai sẽ đặt lại thử thách Siêu khó.
- Hoàn thành năm tình huống Dễ: màn hình chiến thắng hiện tổng điểm tối đa 500; nút CHƠI LẠI khởi động lại vòng Dễ.
- Câu trả lời được phản hồi bằng hiệu ứng xanh có dấu ✓ hoặc đỏ có dấu ✕; đáp án đúng không bị tiết lộ khi chọn sai.
- Kiểm tra nút bật/tắt âm thanh và hiệu ứng nạp; khi tắt tiếng, logic trò chơi vẫn hoạt động.
- Thử tạm dừng, tiếp tục, chơi lại và tắt webcam.
