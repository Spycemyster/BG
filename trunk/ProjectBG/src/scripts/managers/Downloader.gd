extends Node

# maps paths to data for non-persistent downloading
var loaded_data : Dictionary;

func get_file(download_path : String, save_path : String) -> bool:
	var task : DownloaderTask = DownloaderTask.new();
	task.download_path = download_path;
	task.save_path = save_path;
	var status = await task.download();
	return status;

func create_texture(path : String) -> Texture2D:
	var img = Image.new();
	var err = img.load(path);
	if err != OK:
		print("Error loading the image" + path);
		var dir = Directory.new();
		dir.remove(path);
		return null;
	var img_texture = ImageTexture.new();
	return img_texture.create_from_image(img);


# A task object that asynchronously performs a get from Firebase or disk
class DownloaderTask:
	var save_path : String;
	var download_path : String;
	var get_task : StorageTask;
	const DEFAULT_REFRESH_FILE_TIME := 24 * 60 * 60;
	signal finished(saved_to);
	
	func download(refresh_time := DEFAULT_REFRESH_FILE_TIME) -> bool:
		var file = File.new();
		if file.file_exists(save_path) and \
			Time.get_unix_time_from_system() - file.get_modified_time(save_path) < refresh_time:
				print("Skipping download. File already exists and is not old enough for refresh");
				return false;
		get_task = Firebase.Storage.ref(download_path).get_data();
		print("Getting file data");
		await get_task.task_finished;
		
		print("Saving file data");
		if get_task.data == null or get_task.data is Dictionary:
			print("Could not load image: Error returned from Firebase - " + download_path);
			emit_signal("finished", save_path);
			return false;
		var dir = Directory.new();
		dir.make_dir_recursive(save_path.get_base_dir());
		file.open(save_path, File.WRITE_READ);
		file.store_buffer(get_task.data);
		file.close();
		emit_signal("finished", save_path);
		return true;
