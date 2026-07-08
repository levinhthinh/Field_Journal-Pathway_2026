# Field Journal-Pathway 2026
Field Journal là một website giúp những dùng lưu lại những thông tin quan trọng trong cuộc sống hằng ngày. Ứng dụng chia ra thành 2 phần: phần công việc (todo) và phần nhật kí (journal). Phần công việc giúp người dùng ghi lại những công việc cần thực hiện, phần nhật kí cho phép người dùng ghi lại những ý tưởng bất chợt, ghi lại cảm xúc ngày hôm đó. 


Field Journal xuất phát từ ý tưởng dựa trên tên của công ty văn phòng phẩm Field Notes với những sản phẩm nổi bật về những quyển sổ cầm tay và cách ghi chú theo kiểu “common place book”, một quyển sổ dùng để mang theo cả ngày để ghi chú lại những điều cần làm, và cảm xúc cũng như những điều thú vị của ngày hôm đó. Có thể hiểu đơn giản hơn là một cuốn nhật kí đa năng được mang theo mọi lúc mọi nơi. Nhưng điều đó hơi bất tiện khi túi chúng ta dã phải chứa chìa khóa xe, điện thoại, ví tiền,… Do đó nhóm em quyết định việc đưa quyển sổ nhỏ đó vào bên trong chiếc điện thoại qua dự án Field Journal. 


Với giao diện đơn giản, trực quan và dễ sử dụng, ứng dụng phù hợp với nhiều đối tượng người dùng, từ học sinh cho đến những người đã có công việc.

Thông qua dự án này, nhóm em mong muốn tạo ra một ứng dụng hữu ích và tạo thói quen ghi chép, lữu giữ những khoảnh khắc trong cuộc sống thường ngày.


## Installments 

### Prerequisites
    - Python 3.12+
    - Git

### Commands

```bash
#Clone the repository:
git clone 'https://github.com/levinhthinh/Field_Journal-Pathway_2026'
cd Field_Journal-Pathway_2026

#Activate virtual environment
python -m venv .venv
source .venv/bin/activate #if you use Linux/ MacOS
.\.venv\Scripts\Activate.ps1 # if you use Windows

#install dependencies
pip install -r requirements.txt

#run server
cd Field_Journal
python manage.py migrate
python manage.py runserver
```

Or you could use the install and run scripts.

#### Linux/MacOS Script

```bash
chmod +x install.sh
chmod +x run.sh
./install.sh
./run.sh
```

#### Windows (PowerShell) Script

```powershell
.\install.ps1
.\run.ps1
```