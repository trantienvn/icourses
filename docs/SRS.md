## SRS – Hệ thống quản lý lớp học và thi trực tuyến tích hợp AI

AI Online Examination & Classroom Management System · Phiên bản 1.0 (Draft) · Theo khung IEEE 830/29148

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu đặc tả yêu cầu phần mềm (SRS) cho hệ thống quản lý lớp học, ngân hàng câu hỏi, thi trực tuyến và chấm điểm có hỗ trợ AI. Đối tượng đọc: giảng viên hướng dẫn, nhóm phát triển, tester.

### 1.2 Phạm vi

Hệ thống web responsive (Desktop/Tablet/Mobile) cho phép: quản lý tài khoản và lớp học; tạo/quản lý câu hỏi; sinh câu hỏi bằng AI từ tài liệu; tạo đề, giao đề, làm bài, tự động lưu, tự động nộp; chấm tự động và chấm tự luận bằng AI (đề xuất); thống kê kết quả.

Ngoài phạm vi (v1.0): giám sát bằng camera/AI proctoring, ứng dụng native, thanh toán, LMS tích hợp (Moodle), SSO doanh nghiệp.

### 1.3 Định nghĩa & viết tắt

| Thuật ngữ | Nghĩa |
| --- | --- |
| SRS | Software Requirements Specification |
| RBAC | Role-Based Access Control |
| Attempt | Một lần làm bài của một sinh viên với một đề |
| Assignment | Việc giao một đề cho lớp/cá nhân kèm thời hạn, số lần làm |
| Question Bank | Ngân hàng câu hỏi của giáo viên |
| Rubric | Thang tiêu chí chấm tự luận |
| FR / NFR / BR | Functional / Non-functional / Business Rule |

### 1.4 Tài liệu tham khảo

Context dự án (2 tài liệu), IEEE 830-1998, OWASP ASVS, tài liệu API của nhà cung cấp LLM.

## 2. Mô tả tổng quan

### 2.1 Bối cảnh sản phẩm

Kiến trúc 3 tầng: Angular (UI) ⇄ REST/WebSocket ⇄ Node.js/Express ⇄ PostgreSQL, Redis, File Storage (Local/MinIO), AI Service (LLM). Khóa API của AI chỉ tồn tại ở backend.

### 2.2 Nhóm người dùng

| Vai trò | Mô tả | Mức tin cậy |
| --- | --- | --- |
| ADMIN | Quản trị toàn hệ thống, tài khoản, cấu hình AI, audit log | Cao |
| TEACHER | Quản lý lớp mình phụ trách, câu hỏi, đề, chấm bài | Trung bình |
| STUDENT | Tham gia lớp, làm bài, xem kết quả của mình | Thấp (không tin dữ liệu client) |

### 2.3 Môi trường vận hành

Trình duyệt hiện đại (Chrome, Edge, Firefox, Safari – 2 phiên bản mới nhất). Triển khai Docker Compose: Nginx, Node.js, PostgreSQL, Redis, MinIO.

### 2.4 Ràng buộc

Frontend: Angular + TypeScript + Angular Material/Ng-Zorro. Backend: Node.js + Express (đã chốt). DB: PostgreSQL. AI: API tương thích OpenAI; endpoint, API key và model đặt trong file .env của backend (AI_BASE_URL, AI_API_KEY, AI_MODEL).

JWT + Refresh Token, ưu tiên HttpOnly Cookie.

Phạm vi đồ án: ưu tiên luồng cốt lõi Tài liệu → AI → Duyệt → Ngân hàng → Đề → Làm bài → Chấm → Phân tích.

### 2.5 Giả định & phụ thuộc

Có kết nối Internet ổn định tới nhà cung cấp LLM; chi phí/quota AI do Admin cấu hình.

Có dịch vụ email (SMTP) để gửi mật khẩu tạm/thông báo.

Kết quả AI luôn là đề xuất, giáo viên quyết định cuối cùng.

## 3. Yêu cầu chức năng

Ưu tiên: M = Must, S = Should, C = Could. Phase theo mục 10.

### 3.1 Xác thực & phân quyền (AUTH)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-AUTH-01 | Đăng nhập bằng username/email + mật khẩu; trả JWT access (15 phút) và refresh token (HttpOnly, Secure, SameSite; 7 ngày, xoay vòng) | M |
| FR-AUTH-02 | Làm mới token; thu hồi refresh token khi đăng xuất/đổi mật khẩu | M |
| FR-AUTH-03 | Đăng ký tự do chỉ cho STUDENT (xác thực email; Admin có thể tắt); TEACHER do Admin tạo | M |
| FR-AUTH-04 | Quên/đặt lại mật khẩu qua email (token một lần, hết hạn 15 phút) | S |
| FR-AUTH-05 | Bắt buộc đổi mật khẩu lần đăng nhập đầu với tài khoản do Admin/Teacher tạo | M |
| FR-AUTH-06 | RBAC theo permission (vd: classroom:create, exam:publish, result:read:self); ADMIN = * | M |
| FR-AUTH-07 | Kiểm tra quyền ở backend cho mọi API, bao gồm kiểm tra quyền sở hữu tài nguyên (resource ownership). Sai quyền → 403; không tồn tại/không thấy → 404 | M |
| FR-AUTH-08 | Khóa tạm tài khoản sau 5 lần đăng nhập sai liên tiếp (15 phút) | S |

### 3.2 Quản lý tài khoản (USER)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-USER-01 | Admin CRUD tài khoản Teacher/Student; trạng thái ACTIVE/LOCKED/DISABLED; reset mật khẩu | M |
| FR-USER-02 | Xóa tài khoản = vô hiệu hóa (soft delete), giữ lịch sử thi | M |
| FR-USER-03 | Người dùng xem/sửa hồ sơ cá nhân (trường được phép), đổi mật khẩu | M |
| FR-USER-04 | Teacher tạo nhanh tài khoản Student trong lớp mình: sinh mật khẩu tạm, gửi email, ép đổi mật khẩu lần đầu | S |
| FR-USER-05 | Import tài khoản Student từ CSV/Excel (student_code, name, email); báo cáo dòng lỗi | S |
| FR-USER-06 | Mã sinh viên (student_code) là duy nhất toàn hệ thống | M |

### 3.3 Quản lý môn học (SUBJ)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-SUBJ-01 | Admin/Teacher CRUD môn học (mã, tên, mô tả); không xóa môn đang có lớp/câu hỏi (chỉ archive) | M |
| FR-SUBJ-02 | Quản lý chủ đề (topic) thuộc môn học | M |

### 3.4 Quản lý lớp học (CLASS)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-CLASS-01 | Teacher tạo lớp: tên, mã lớp, mô tả, môn, năm học, học kỳ, ngày bắt đầu/kết thúc, trạng thái (ACTIVE/CLOSED) | M |
| FR-CLASS-02 | Tự sinh class code duy nhất và join code ngẫu nhiên 6 ký tự (loại ký tự dễ nhầm 0/O, 1/I); Teacher có thể đổi/vô hiệu join code | M |
| FR-CLASS-03 | Sửa, đóng/mở, xóa lớp. Xóa lớp = soft delete; không xóa nếu đã có attempt (chỉ đóng) | M |
| FR-CLASS-04 | Hỗ trợ nhiều giáo viên: OWNER, CO_TEACHER, ASSISTANT (quyền khác nhau) | S |
| FR-CLASS-05 | Student tham gia lớp bằng join code: kiểm tra lớp tồn tại → ACTIVE → chưa là thành viên → không BLOCKED → thêm | M |
| FR-CLASS-06 | Teacher thêm học sinh: chọn từ danh sách / nhập mã SV / import CSV-Excel | M |
| FR-CLASS-07 | Trạng thái thành viên: ACTIVE, INACTIVE, BLOCKED, REMOVED. Xóa khỏi lớp chỉ đặt REMOVED + removed_at, không xóa lịch sử thi | M |
| FR-CLASS-08 | Student xem lớp đã tham gia, giáo viên phụ trách; rời lớp nếu lớp cho phép | S |
| FR-CLASS-09 | Danh sách thành viên: họ tên, mã SV, email, trạng thái, ngày tham gia, số bài đã làm, điểm TB; tìm kiếm, lọc, phân trang | M |
| FR-CLASS-10 | Teacher chỉ thấy/quản lý lớp mình sở hữu hoặc được phân công | M |

### 3.5 Ngân hàng câu hỏi (QB)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-QB-01 | CRUD câu hỏi 6 loại: single_choice, multiple_choice, true_false, fill_blank, matching, essay | M |
| FR-QB-02 | Thuộc tính: nội dung (rich text/ảnh), loại, môn, chủ đề, độ khó (easy/medium/hard), điểm, đáp án, đáp án đúng, giải thích, tag, người tạo, ngày tạo/sửa, trạng thái (DRAFT/APPROVED/ARCHIVED) | M |
| FR-QB-03 | Tìm kiếm full-text; lọc theo môn, chủ đề, độ khó, loại, tag, trạng thái, nguồn (manual/AI) | M |
| FR-QB-04 | Nhân bản câu hỏi; import/export (CSV/Excel/JSON) | S |
| FR-QB-05 | Validate theo loại: single = đúng 1 đáp án đúng; multiple ≥ 1; true_false = 2 lựa chọn; matching ≥ 2 cặp; essay có expected answer + rubric (tùy chọn) | M |
| FR-QB-06 | Câu hỏi đã dùng trong đề đã có attempt: sửa tạo phiên bản mới (versioning), đề cũ giữ snapshot | M |
| FR-QB-07 | Phạm vi chia sẻ: PRIVATE (mặc định) / chia sẻ trong môn học | C |

### 3.6 Tài liệu & AI sinh câu hỏi (AIGEN)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-DOC-01 | Upload PDF, DOCX, PPTX, TXT, XLSX, hình ảnh; kiểm tra MIME thật (magic bytes), đuôi file, dung lượng tối đa (đề xuất 20 MB/file), quét an toàn cơ bản | M |
| FR-DOC-02 | Trích xuất văn bản (OCR bằng Tesseract cho ảnh/PDF scan); chia chunk theo cấu trúc (heading/đoạn) ~800–1500 token, overlap ~10% | M |
| FR-DOC-03 | Trạng thái xử lý tài liệu: UPLOADED → EXTRACTING → READY / FAILED (xử lý bất đồng bộ qua queue) | M |
| FR-AIGEN-01 | Form cấu hình: số câu, số đáp án/câu, loại (chọn nhiều loại + phân bổ số câu theo loại), độ khó, chủ đề, ngôn ngữ, có/không giải thích, điểm/câu | M |
| FR-AIGEN-02 | Sinh câu hỏi từ tài liệu hoặc từ chủ đề/prompt | M |
| FR-AIGEN-03 | Output là JSON theo schema cố định; backend validate (schema + luật theo loại + số lượng + ngôn ngữ). Không đạt → tự retry tối đa 2 lần, sau đó báo lỗi | M |
| FR-AIGEN-04 | Vòng đời: GENERATING → GENERATED → REVIEWING → APPROVED → PUBLISHED (vào Question Bank); FAILED, CANCELLED | M |
| FR-AIGEN-05 | Màn hình review: xem, sửa nội dung/đáp án/đáp án đúng/điểm/giải thích, xóa, regenerate từng câu, accept từng câu hoặc hàng loạt | M |
| FR-AIGEN-06 | Mỗi câu lưu nguồn tham chiếu (document, chunk) để giáo viên đối chiếu | S |
| FR-AIGEN-07 | Phát hiện câu trùng/na ná trong cùng lô và với Question Bank (so khớp văn bản/embedding) | C |
| FR-AIGEN-08 | Giới hạn quota (số lần/ngày, token/tháng) theo vai trò; ghi log chi phí | S |
| FR-AIGEN-09 | Không lưu trực tiếp vào Question Bank khi chưa qua review | M |

### 3.7 Đề thi (EXAM)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-EXAM-01 | Thuộc tính đề: tên, mô tả, môn, danh sách câu hỏi, tổng điểm, điểm đạt, thời lượng, số lần làm, random câu/đáp án, hiển thị đáp án/giải thích sau nộp, chính sách chấm multiple choice | M |
| FR-EXAM-02 | Manual Exam: chọn từng câu từ Question Bank, kéo thả sắp xếp, đặt điểm riêng | M |
| FR-EXAM-03 | Random Exam: cấu hình ma trận (vd 20 câu = 5 dễ + 10 TB + 5 khó, theo chủ đề); hệ thống bốc câu; cảnh báo nếu không đủ câu | S |
| FR-EXAM-04 | Trạng thái đề: DRAFT → PUBLISHED → CLOSED / REVOKED. Đề đã PUBLISHED có attempt thì bị khóa nội dung | M |
| FR-EXAM-05 | Khi publish, tạo snapshot câu hỏi/đáp án/điểm vào đề (độc lập với Question Bank sau này) | M |
| FR-EXAM-06 | Giao đề (assignment): cho một lớp, nhiều lớp, hoặc cá nhân (thi bù); thời gian mở/đóng, số lần làm, thời lượng | M |
| FR-EXAM-07 | Thu hồi đề; gia hạn thời gian/cộng thêm thời gian cho từng sinh viên | S |
| FR-EXAM-08 | Mật khẩu vào thi (tùy chọn) | C |

### 3.8 Làm bài thi (ATT)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-ATT-01 | Student chỉ thấy đề được giao, đang trong cửa sổ thời gian và còn lượt làm | M |
| FR-ATT-02 | Bắt đầu attempt (POST /exams/:id/start): backend tạo attempt, ghi started_at, tính deadline = min(started_at + duration, assignment.end); trả về đề đã random (thứ tự lưu theo attempt) | M |
| FR-ATT-03 | Nếu đã có attempt IN_PROGRESS thì tiếp tục attempt đó (không tạo mới) | M |
| FR-ATT-04 | Giao diện: hiển thị câu x/N, timer, chọn đáp án, nhập tự luận, đánh dấu (flag), bỏ qua, trước/tiếp, lưới điều hướng (drawer/bottom sheet trên mobile) | M |
| FR-ATT-05 | Auto-save: lưu khi đổi đáp án (debounce) và định kỳ 15–30 s; lưu cả câu hiện tại, flag, essay. Hàng đợi offline phía client, đồng bộ lại khi có mạng | M |
| FR-ATT-06 | Khôi phục khi tải lại/mất mạng/đổi thiết bị: trạng thái lấy từ server | M |
| FR-ATT-07 | Timer client chỉ để hiển thị; đồng bộ với server_time định kỳ; backend là nguồn xác thực | M |
| FR-ATT-08 | Hết giờ: backend từ chối ghi đáp án mới (kèm dung sai mạng ≤ 5 s đề xuất), tự động submit (job nền) → trạng thái AUTO_SUBMITTED → chấm | M |
| FR-ATT-09 | Nộp bài: xác nhận hiển thị số câu chưa làm/đã flag; sau nộp khóa attempt (idempotent, nộp lại không ảnh hưởng) | M |
| FR-ATT-10 | Chống gian lận cơ bản: ghi log chuyển tab/mất focus, chặn copy-paste (tùy cấu hình), một phiên đăng nhập hoạt động/attempt, cảnh báo ghi nhận cho giáo viên, không tự động nộp bài | C |

Trạng thái attempt: NOT_STARTED → IN_PROGRESS → SUBMITTED / AUTO_SUBMITTED → GRADING → GRADED → (RELEASED).

### 3.9 Chấm điểm (GRADE)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-GRADE-01 | Tự động chấm single, true_false, fill_blank (so khớp không phân biệt hoa/thường, trim, danh sách đáp án chấp nhận), matching (điểm theo từng cặp) | M |
| FR-GRADE-02 | Multiple choice: policy Exact Match hoặc Partial Credit ((chọn đúng − chọn sai) / tổng đáp án đúng, tối thiểu 0), cấu hình theo đề/câu | M |
| FR-GRADE-03 | Điểm = Σ điểm câu; tổng điểm đề quy về thang cấu hình (mặc định 10) | M |
| FR-GRADE-04 | Essay: giáo viên chấm tay hoặc dùng AI. Đầu vào AI: câu hỏi + expected answer + câu trả lời + rubric; đầu ra JSON: score, maxScore, feedback, criteria[] | M |
| FR-GRADE-05 | Validate điểm AI (0 ≤ score ≤ maxScore, tổng criteria khớp); không hợp lệ → retry/báo lỗi | M |
| FR-GRADE-06 | Điểm AI là đề xuất (AI_SUGGESTED). Giáo viên: accept, sửa điểm/feedback, yêu cầu chấm lại, lưu lịch sử thay đổi | M |
| FR-GRADE-07 | Chấm hàng loạt essay theo đề/lớp bằng hàng đợi, hiển thị tiến độ | S |
| FR-GRADE-08 | Bài chưa chấm xong essay có trạng thái PARTIALLY_GRADED; kết quả tự công bố nếu đề không có essay; đề có essay chỉ công bố khi giáo viên release | M |
| FR-GRADE-09 | Phúc khảo: Student gửi yêu cầu, Teacher xử lý | C |

### 3.10 Kết quả & Analytics (RES)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-RES-01 | Student xem: tổng điểm, điểm từng câu, số đúng/sai/bỏ trống, thời gian làm; đáp án/giải thích/feedback AI tùy cấu hình đề | M |
| FR-RES-02 | Student xem lịch sử làm bài của mình | M |
| FR-RES-03 | Dashboard giáo viên theo đề/lớp: tổng SV, đã làm/chưa làm, TB/cao nhất/thấp nhất, tỉ lệ đạt/không đạt, phân bố điểm | M |
| FR-RES-04 | Phân tích theo câu: % đúng, tỉ lệ bỏ trống, thời gian TB, độ khó thực tế, độ phân biệt (discrimination index) | S |
| FR-RES-05 | Theo dõi tiến độ trực tiếp khi đang thi (số SV đang làm/đã nộp) qua WebSocket | S |
| FR-RES-06 | Export kết quả CSV/Excel/PDF | S |
| FR-RES-07 | Teacher dashboard (số lớp/học sinh/đề, lớp & đề gần đây); Student dashboard (đề sắp tới, đã hoàn thành) | M |

### 3.11 Thông báo & Audit (SYS)

| ID | Yêu cầu | Ưu tiên |
| --- | --- | --- |
| FR-SYS-01 | Thông báo in-app/email: được giao đề, sắp hết hạn, có kết quả, bị xóa khỏi lớp | S |
| FR-SYS-02 | Audit log bất biến: ai, hành động, đối tượng, giá trị trước/sau, IP, thời điểm. Bắt buộc cho: đăng nhập, tạo/xóa/khóa tài khoản, thao tác lớp & thành viên, publish/revoke đề, sửa điểm, cấu hình AI | M |
| FR-SYS-03 | Admin cấu hình AI: model (trong danh sách cho phép), quota, prompt template, bật/tắt tính năng; endpoint và API key chỉ đặt trong .env, không hiển thị hay sửa trên giao diện | S |
| FR-SYS-04 | Teacher xem audit log giới hạn trong lớp/đề của mình | C |

## 4. Ma trận quyền (tóm tắt)

Ghi chú: ✓ toàn quyền · O = chỉ tài nguyên mình sở hữu/phụ trách · S = chỉ dữ liệu của bản thân · ✗ không.

| Chức năng | Admin | Teacher | Student |
| --- | --- | --- | --- |
| Quản lý tài khoản | ✓ | O (HS trong lớp mình) | S |
| Tạo Teacher | ✓ | ✗ | ✗ |
| Tạo lớp / quản lý lớp | ✓ | ✓ (O) | ✗ |
| Tham gia lớp bằng mã | ✓ | ✗ (mặc định) | ✓ |
| Question Bank, upload tài liệu, AI sinh câu | ✓ | ✓ (O) | ✗ |
| Tạo/publish/giao đề | ✓ | ✓ (O) | ✗ |
| Làm bài | tùy chọn | tùy chọn | ✓ (đề được giao) |
| Chấm bài, AI chấm | ✓ | ✓ (O) | ✗ |
| Xem kết quả | ✓ | ✓ (lớp mình) | S |
| Audit log | ✓ | O | ✗ |

## 5. Quy tắc nghiệp vụ (BR)

BR-01 Mọi kiểm tra quyền thực hiện ở backend; Angular Guard chỉ ẩn/hiện UI.

BR-02 Student chỉ làm đề được giao (qua lớp ACTIVE membership hoặc giao cá nhân).

BR-03 Số attempt ≤ max_attempts của assignment; điểm cuối theo chính sách (cao nhất (mặc định)/mới nhất/trung bình – cấu hình theo đề).

BR-04 Thời gian hợp lệ do server quyết định; mọi timestamp lưu UTC, hiển thị theo múi giờ người dùng (mặc định Asia/Ho_Chi_Minh).

BR-05 Bài làm, kết quả tách độc lập với trạng thái thành viên lớp; REMOVED/BLOCKED không xóa lịch sử.

BR-06 BLOCKED: không bắt đầu attempt mới; attempt đang chạy xử lý theo cấu hình (mặc định cho phép nộp).

BR-07 Đề đã publish có attempt: không sửa câu hỏi/điểm; muốn sửa phải nhân bản đề.

BR-08 Điểm AI không tự động thành điểm chính thức; chỉ release sau khi Teacher xác nhận (hoặc Teacher bật chế độ "tự động chấp nhận" có ghi log).

BR-09 Câu hỏi do AI sinh mặc định trạng thái DRAFT, chỉ vào Question Bank (APPROVED) sau review.

BR-10 Mọi thay đổi điểm sau khi release phải có lý do và ghi audit log.

BR-11 Không gửi thông tin định danh nhạy cảm của sinh viên (email, SĐT, mã SV) tới nhà cung cấp LLM; chấm essay dùng ID ẩn danh.

## 6. Mô hình dữ liệu

### 6.1 Thực thể chính

users, roles, permissions, role_permissions, user_roles, student_profiles, teacher_profiles, subjects, topics, classrooms, classroom_teachers, classroom_members, questions, question_versions, question_options, question_tags, exams, exam_questions (snapshot), exam_assignments, exam_attempts, answers, essay_answers, documents, document_chunks, ai_generations, ai_generation_items, ai_grading_results, results, notifications, audit_logs, refresh_tokens.

### 6.2 Quan hệ then chốt

User 1–1 TeacherProfile/StudentProfile; User N–N Role.

Classroom N–N Student qua classroom_members(status, joined_at, removed_at); Classroom N–N Teacher qua classroom_teachers(role).

Exam 1–N ExamQuestion (snapshot); Exam 1–N ExamAssignment (target: classroom hoặc user).

ExamAssignment 1–N ExamAttempt; ExamAttempt 1–N Answer; Answer 0–1 AiGradingResult.

Document 1–N DocumentChunk; AiGeneration 1–N AiGenerationItem → (khi approve) Question.

### 6.3 Ràng buộc dữ liệu

UNIQUE: users.email, users.username, student_profiles.student_code, classrooms.code, classrooms.join_code, (classroom_id, student_id) ở members.

Soft delete (deleted_at) cho users, classrooms, questions, exams.

Index: questions(subject_id, topic_id, difficulty, type), exam_attempts(assignment_id, user_id), answers(attempt_id, question_id) UNIQUE.

Khóa ngoại dùng ON DELETE RESTRICT cho dữ liệu thi.

## 7. Yêu cầu giao diện

### 7.1 Giao diện người dùng

Responsive: Desktop 1920×1080, Tablet 1024×768, Mobile 390×844; portrait/landscape.

Màn hình thi: timer luôn hiển thị (sticky), nút ≥ 44×44 px, điều hướng câu dạng drawer/bottom sheet trên mobile, không cần zoom, cảnh báo khi còn 5 phút / 1 phút.

Trạng thái câu trong lưới: chưa làm / đã làm / flag / hiện tại.

Trạng thái lưu rõ ràng: "Đã lưu" / "Đang lưu…" / "Mất kết nối – sẽ đồng bộ lại".

Hỗ trợ i18n (vi mặc định, en tùy chọn); chế độ sáng/tối (C).

### 7.2 Route chính (Angular)

/login, /teacher/{dashboard,classrooms,classrooms/:id,questions,question-bank,ai-generate,exams,exams/create,analytics}, /student/{dashboard,classrooms,exams,exams/:id,exams/:id/result}, /admin/{dashboard,users,teachers,students,classrooms,settings,audit-logs}. Guard: authGuard, roleGuard, permissionGuard.

### 7.3 Giao diện hệ thống ngoài

LLM API (HTTPS, key ở backend, timeout, retry với backoff, circuit breaker).

SMTP; MinIO/S3 (presigned URL).

REST: JSON, versioning /api/v1, phân trang page/limit, lỗi chuẩn {code, message, details}; OpenAPI/Swagger bắt buộc.

WebSocket/Socket.IO: kênh attempt:{id} (đồng bộ timer/trạng thái), exam:{id}:monitor (cho giáo viên).

## 8. Yêu cầu phi chức năng (NFR)

| ID | Nhóm | Yêu cầu | Chỉ tiêu đề xuất |
| --- | --- | --- | --- |
| NFR-PERF-01 | Hiệu năng | API thường (CRUD, lưu đáp án) | p95 < 300 ms |
| NFR-PERF-02 | Hiệu năng | Tải đề khi bắt đầu thi | < 2 s |
| NFR-PERF-03 | Hiệu năng | Thi đồng thời | ≥ 500 attempt đồng thời (v1), mở rộng ngang được |
| NFR-PERF-04 | Hiệu năng | AI sinh/chấm chạy bất đồng bộ, không chặn request; báo tiến độ | — |
| NFR-REL-01 | Tin cậy | Không mất đáp án đã được xác nhận lưu; mất tối đa 1 chu kỳ auto-save khi sự cố client | — |
| NFR-REL-02 | Tin cậy | Auto-submit bằng job nền độc lập với client; khôi phục job sau restart | — |
| NFR-AVL-01 | Sẵn sàng | Uptime trong giờ thi | ≥ 99% |
| NFR-SEC-01 | Bảo mật | HTTPS/TLS; mật khẩu băm Argon2id hoặc bcrypt (cost ≥ 12) | — |
| NFR-SEC-02 | Bảo mật | validate đầu vào bằng Zod/Joi, ORM tham số hóa (chống SQLi), sanitize HTML (chống XSS), CSRF cho cookie, CORS whitelist, security headers (Helmet) | OWASP Top 10 |
| NFR-SEC-03 | Bảo mật | Rate limiting (đăng nhập, AI, upload); khóa brute-force | — |
| NFR-SEC-04 | Bảo mật | Upload: MIME/magic bytes, giới hạn dung lượng, đổi tên file, lưu ngoài web root, không thực thi | — |
| NFR-SEC-05 | Bảo mật | Chống prompt injection: nội dung tài liệu/bài làm đặt trong khối dữ liệu, không làm thay đổi chỉ dẫn hệ thống; output chỉ nhận qua schema | — |
| NFR-SEC-06 | Bảo mật | Không để lộ đáp án đúng trong payload đề gửi cho Student trước khi nộp | — |
| NFR-PRIV-01 | Riêng tư | Tuân thủ Nghị định 13/2023/NĐ-CP: mục đích thu thập, quyền truy cập/xóa dữ liệu, lưu giữ tối thiểu | — |
| NFR-USE-01 | Khả dụng | WCAG 2.1 AA ở màn hình thi (tương phản, bàn phím, nhãn) | — |
| NFR-MNT-01 | Bảo trì | Kiến trúc module; unit test ≥ 70% logic nghiệp vụ lõi (chấm điểm, timer, phân quyền); CI lint/test/build | — |
| NFR-OBS-01 | Quan sát | Log có cấu trúc + request-id, health check, metrics cơ bản | — |
| NFR-DEP-01 | Triển khai | Docker Compose một lệnh; biến môi trường cho secret; migration có version | — |
| NFR-BKP-01 | Sao lưu | Backup PostgreSQL hằng ngày, thử khôi phục định kỳ | RPO ≤ 24 h |
| NFR-AI-01 | AI | Gọi API chuẩn OpenAI (chat completions), endpoint/key/model đọc từ .env, không lưu key trong DB, mã nguồn hay log; ghi log prompt/response (đã ẩn danh), model, token, độ trễ; timeout 60 s; fallback thông báo lỗi thân thiện | — |

## 9. Luồng nghiệp vụ & Use Case chính

| UC | Tên | Tác nhân | Tiền điều kiện | Kết quả |
| --- | --- | --- | --- | --- |
| UC-01 | Đăng nhập | All | Tài khoản ACTIVE | Có phiên hợp lệ |
| UC-02 | Tạo lớp & join code | Teacher | Đã đăng nhập | Lớp ACTIVE |
| UC-03 | Tham gia lớp bằng mã | Student | Mã hợp lệ, lớp ACTIVE | Thành viên ACTIVE |
| UC-04 | Import danh sách học sinh | Teacher | Là chủ lớp | Thành viên thêm + báo cáo lỗi |
| UC-05 | Tạo câu hỏi thủ công | Teacher | Có môn học | Câu hỏi vào ngân hàng |
| UC-06 | Upload tài liệu | Teacher | File hợp lệ | Tài liệu READY |
| UC-07 | AI sinh câu hỏi | Teacher | Tài liệu READY/prompt | Lô câu GENERATED |
| UC-08 | Review & duyệt câu AI | Teacher | Lô GENERATED | Câu APPROVED → Question Bank |
| UC-09 | Tạo đề (Manual/Random) | Teacher | Đủ câu hỏi | Đề DRAFT |
| UC-10 | Publish & giao đề | Teacher | Đề hợp lệ | Assignment được tạo, snapshot đề |
| UC-11 | Làm bài thi | Student | Được giao, trong giờ | Attempt SUBMITTED |
| UC-12 | Chấm tự động | System | Attempt đã nộp | Điểm trắc nghiệm |
| UC-13 | AI chấm & duyệt tự luận | Teacher, System | Có essay | Điểm cuối cùng |
| UC-14 | Release & xem kết quả | Teacher, Student | Đã chấm xong | Student xem kết quả |
| UC-15 | Xem thống kê | Teacher | Có attempt | Dashboard/Export |
| UC-16 | Quản lý người dùng/AI config | Admin | Là Admin | Cập nhật + audit |

### 9.1 Đặc tả mẫu – UC-11 Làm bài thi

Luồng chính: (1) Student mở đề được giao → (2) hệ thống kiểm tra quyền, cửa sổ thời gian, số lượt → (3) tạo/tiếp tục attempt, trả đề + deadline + server_time → (4) Student trả lời, hệ thống auto-save → (5) Student nộp (xác nhận) → (6) backend khóa attempt, kích hoạt chấm → (7) hiển thị trạng thái/kết quả theo cấu hình.

Luồng thay thế: A1 mất mạng → lưu cục bộ, đồng bộ lại; A2 tải lại trang → khôi phục từ server; A3 hết giờ → auto-submit; A4 mở trên thiết bị khác → thiết bị cũ bị vô hiệu.

Ngoại lệ: E1 hết lượt/ngoài giờ → 403 + thông báo; E2 bị BLOCKED → từ chối; E3 ghi đáp án sau deadline → 409 ATTEMPT_LOCKED.

Hậu điều kiện: attempt bất biến; điểm trắc nghiệm được tính; log đầy đủ.

### 9.2 Đặc tả mẫu – UC-07/08 AI sinh & duyệt câu hỏi

Luồng chính: chọn tài liệu + cấu hình → tạo ai_generation (GENERATING, job queue) → trích chunk liên quan → gọi LLM theo schema → validate → GENERATED → Teacher review (sửa/xóa/regenerate/accept) → APPROVED → PUBLISHED vào Question Bank.

Ngoại lệ: tài liệu rỗng/ảnh không đọc được → FAILED; JSON sai sau 2 lần retry → FAILED kèm lý do; vượt quota → từ chối.

## 10. Phạm vi & lộ trình triển khai

| Phase | Nội dung | FR chính |
| --- | --- | --- |
| 1 – Auth & RBAC | Login, refresh, RBAC, quản lý tài khoản, audit cơ bản | AUTH, USER, SYS-02 |
| 2 – Classroom | Lớp, join code, thành viên, import, dashboard lớp | SUBJ, CLASS |
| 3 – Question & Exam | Question Bank, đề, giao đề, làm bài, timer, auto-save, chấm trắc nghiệm, kết quả | QB, EXAM, ATT, GRADE-01..03, RES-01..02 |
| 4 – AI | Upload/extract, AI sinh câu hỏi, review, AI chấm essay | DOC, AIGEN, GRADE-04..08 |
| 5 – Advanced | Analytics, Random Exam, Redis, WebSocket, Notification, anti-cheating, PWA, Docker hoàn chỉnh | RES-03..07, EXAM-03, ATT-10, SYS-01 |

## 11. Tiêu chí nghiệm thu (mẫu)

AC-ATT-08: Với attempt hết hạn, mọi request ghi đáp án sau deadline + dung sai đều bị từ chối 409, và attempt được chuyển AUTO_SUBMITTED trong ≤ 30 s.

AC-AIGEN-03: Với 100 lần sinh thử, ≥ 95% trả JSON hợp lệ sau tối đa 2 lần retry; 100% lô không hợp lệ bị chặn lưu.

AC-AUTH-07: Teacher A gọi API của lớp thuộc Teacher B → 403/404; có test tự động cho mọi endpoint nhạy cảm.

AC-CLASS-07: Xóa học sinh khỏi lớp vẫn giữ nguyên 100% attempt/kết quả trước đó.

AC-SEC-06: Payload đề của Student không chứa trường isCorrect/explanation trước khi nộp.

## 12. Rủi ro & vấn đề cần chốt

| # | Vấn đề cần quyết định | Đề xuất |
| --- | --- | --- |
| 1 | Framework backend | Express (đã chốt): chia module router/controller/service/repository, middleware cho auth/RBAC, Zod/Joi để validate |
| 2 | ORM | Prisma (chốt tạm, xem 14.3); migration bắt buộc |
| 3 | LLM & chi phí (đã chốt: API chuẩn OpenAI, endpoint + key trong .env) | Trừu tượng hóa qua AiProvider interface để đổi model/nhà cung cấp tương thích OpenAI |
| 4 | Hàng đợi tác vụ nền (trích xuất, AI, auto-submit) | BullMQ + Redis (kéo Redis lên sớm từ Phase 3–4) |
| 5 | Teacher có được tạo tài khoản Student không | Có, giới hạn trong lớp mình (FR-USER-04) |
| 6 | Chính sách điểm khi nhiều attempt | Mặc định: điểm cao nhất |
| 7 | Teacher có được làm bài / Student có được tạo lớp riêng | Không trong v1 |
| 8 | Rủi ro: AI sinh sai kiến thức / chấm lệch | Bắt buộc review, hiển thị nguồn chunk, cho chấm lại |
| 9 | Rủi ro: tải đột biến khi đồng loạt nộp | Auto-save nhẹ, queue chấm, cache Redis, index DB |

## 13. Phụ lục – Schema JSON chuẩn

AI sinh câu hỏi (rút gọn): questions[] gồm content, type ∈ {single_choice, multiple_choice, true_false, fill_blank, matching, essay}, options[]{content,isCorrect} (hoặc pairs[] cho matching, acceptedAnswers[] cho fill_blank, expectedAnswer+rubric[] cho essay), explanation, difficulty, sourceChunkIds[].

AI chấm essay: score, maxScore, feedback, criteria[]{name,score,maxScore}.

Quy tắc validate chung: đúng số câu/đáp án đã yêu cầu; đúng loại/độ khó/ngôn ngữ; single có đúng 1 đáp án đúng; không trùng đáp án trong một câu; điểm trong khoảng hợp lệ; loại bỏ HTML/script khỏi mọi trường văn bản.

## 14. Rà soát khoảng trống & quyết định mặc định

SRS v1.0 còn thiếu các quyết định dưới đây; mỗi dòng nêu lựa chọn và phương án đã chốt tạm (đổi bằng cách sửa cột cuối hoặc bình luận).

### 14.1 Nghiệp vụ

| # | Vấn đề | Lựa chọn | Chốt |
| --- | --- | --- | --- |
| B1 | Điểm khi làm nhiều lần | Cao nhất / mới nhất / trung bình | Cao nhất (đề cho phép cấu hình) |
| B2 | Chấm matching | Tất cả đúng / theo từng cặp | Theo từng cặp (điểm một phần) |
| B3 | Chấm fill_blank | So khớp chính xác / chuẩn hóa | Chuẩn hóa (bỏ hoa-thường, dấu cách thừa), danh sách đáp án chấp nhận |
| B4 | Partial credit multiple choice | Đúng/tổng / (đúng − sai)/tổng | (Chọn đúng − chọn sai) / tổng đáp án đúng, tối thiểu 0 |
| B5 | Công bố kết quả | Thủ công / tự động | Tự động nếu đề không có essay; có essay thì chờ Teacher release |
| B6 | Thang điểm & làm tròn | 10 / 100 | Thang 10, làm tròn 2 chữ số thập phân |
| B7 | Đăng ký Student | Tự do / chỉ qua mã lớp / Admin tạo | Tự do có xác thực email; Admin có thể tắt |
| B8 | Mật khẩu tạm của Student do Teacher tạo | Gửi email / hiện một lần | Gửi email; không có SMTP thì hiện một lần và bắt đổi |
| B9 | Thiết bị thi | Nhiều phiên / một phiên | Một phiên hoạt động cho mỗi attempt; thiết bị mới thay thế thiết bị cũ |
| B10 | Gian lận (v1) | Chỉ ghi log / tự động nộp | Chỉ ghi log và cảnh báo Teacher, không tự nộp |
| B11 | Chia sẻ câu hỏi giữa Teacher | Riêng tư / theo môn | Riêng tư trong v1 |
| B12 | Học sinh BLOCKED đang thi dở | Cho nộp / hủy | Cho nộp bài đang làm, chặn bắt đầu mới |

### 14.2 AI

| # | Vấn đề | Lựa chọn | Chốt |
| --- | --- | --- | --- |
| A1 | Định dạng đầu ra | JSON mode / json_schema / parse thường | Dùng response_format nếu endpoint hỗ trợ, luôn validate bằng Zod; lỗi thì retry 2 lần |
| A2 | Tài liệu dài | Vector DB (RAG) / chia chunk tuần tự | Chia chunk, phân bổ số câu theo chunk; không dùng vector DB ở v1 (pgvector là mở rộng) |
| A3 | OCR ảnh/PDF scan | Tesseract / vision LLM | Tesseract (tesseract.js), không phụ thuộc model |
| A4 | Thư viện trích xuất | — | PDF: pdfjs-dist; DOCX: mammoth; PPTX: officeparser; XLSX: SheetJS; TXT: đọc trực tiếp |
| A5 | Giới hạn mỗi lần sinh | — | Tối đa 100 trang hoặc 50k token đầu vào, tối đa 50 câu |
| A6 | Chấm essay tự động | Luôn chạy / Teacher bấm | Teacher bấm chạy (theo đề hoặc lớp); gửi ID ẩn danh, không gửi tên/email |
| A7 | Chống prompt injection | — | Nội dung tài liệu/bài làm đặt trong khối dữ liệu có phân cách; system prompt cố định; output chỉ nhận qua schema |
| A8 | Lưu log AI | — | Lưu prompt/response đã ẩn danh 90 ngày để kiểm tra chất lượng |

### 14.3 Kỹ thuật & vận hành

| # | Vấn đề | Lựa chọn | Chốt |
| --- | --- | --- | --- |
| T1 | ORM | Prisma / TypeORM / Knex | Prisma (migration, kiểu an toàn) |
| T2 | Validate | Zod / Joi | Zod |
| T3 | Hàng đợi tác vụ nền | BullMQ / cron | BullMQ + Redis (trích xuất, AI, auto-submit, ghi hàng loạt) |
| T4 | Realtime | Socket.IO / SSE | Socket.IO |
| T5 | Token | — | Access 15 phút; refresh 7 ngày, xoay vòng (rotation), thu hồi khi đổi mật khẩu |
| T6 | Chính sách mật khẩu | — | ≥ 8 ký tự, có chữ và số; Argon2id |
| T7 | Soạn câu hỏi | TipTap / Quill / textarea | TipTap (ảnh, bảng); công thức KaTeX là mức Could |
| T8 | Lưu file | Local / MinIO | Local khi dev, MinIO khi production (qua một lớp StorageService) |
| T9 | Lưu giữ dữ liệu | — | Tài liệu giữ đến khi Teacher xóa; bài thi và kết quả giữ vĩnh viễn; audit log 12 tháng |
| T10 | Kiểm thử | — | Jest + Supertest cho API; Playwright cho luồng thi; ưu tiên test chấm điểm, timer, phân quyền |
| T11 | Biến môi trường | — | .env.example bắt buộc: DB, Redis, JWT, SMTP, MinIO, AI_BASE_URL, AI_API_KEY, AI_MODEL; app dừng khởi động nếu thiếu biến |
| T12 | Múi giờ | — | Lưu UTC, hiển thị Asia/Ho_Chi_Minh |

## 15. Tài liệu còn cần tạo

Sơ đồ Use Case theo vai trò.

ERD và schema PostgreSQL chi tiết.

Sequence diagram: làm bài + auto-submit, AI sinh câu hỏi, AI chấm essay.

Đặc tả API OpenAPI (request/response/mã lỗi).

Wireframe: màn hình thi (desktop/mobile), review câu hỏi AI, dashboard.

Ma trận truy vết FR → Use Case → Test case.
