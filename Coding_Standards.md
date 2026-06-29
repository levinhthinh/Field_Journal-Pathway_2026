ChatGPT bảo nên có cái này

1. ChatGPT khuyến khích sử dụng black formatter
    -> pip install black
    -> black {path_to_file}
    -> thí dụ path hiện tại là C:\\user\...\Field_Journal-Pathway_2026
    -> black Field_Journal/Field_Journal/settings.py (relative path) sẽ format lại settings.py
2. Sử dụng snake_case (không viết hoa) cho variables và function
3. Sử dụng PascalCase cho class (model, serializer, class-base views, ...)
4. Sử dụng Pascale_Snake_Case cho tên file (tao tự bịa)

Khi dùng Source Control để push git, nhớ là kéo tất cả file vào Staged Changes rồi mới push được 