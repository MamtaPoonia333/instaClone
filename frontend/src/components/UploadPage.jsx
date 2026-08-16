// New-post form: caption input, image picker + preview, submit.
function UploadPage({
  uploadCaption,
  onChangeUploadCaption,
  uploadPreview,
  uploadError,
  onImagePick,
  onSubmit
}) {
  return (
    <section className="card upload-card">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Write a caption"
          value={uploadCaption}
          onChange={(e) => onChangeUploadCaption(e.target.value)}
        />
        <label className="file-label icon-only" aria-label="Choose post image">
          <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 4.75H5A2.25 2.25 0 0 0 2.75 7v10A2.25 2.25 0 0 0 5 19.25h14A2.25 2.25 0 0 0 21.25 17V7A2.25 2.25 0 0 0 19 4.75M12 8.25a.75.75 0 0 1 .75.75v2.25H15a.75.75 0 0 1 0 1.5h-2.25V15a.75.75 0 0 1-1.5 0v-2.25H9a.75.75 0 0 1 0-1.5h2.25V9a.75.75 0 0 1 .75-.75" />
          </svg>
          <input
            className="file-input-hidden"
            type="file"
            accept="image/*"
            onChange={onImagePick}
          />
        </label>
        {uploadPreview ? <img src={uploadPreview} alt="Upload preview" /> : null}
        <button type="submit" aria-label="Publish post">
          <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19.6 3.2 3.9 9.48a1 1 0 0 0 .08 1.89l5.3 1.73 1.74 5.3a1 1 0 0 0 1.89.08L20.8 4.4a1 1 0 0 0-1.2-1.2m-7.62 13.38-1.08-3.3a1.75 1.75 0 0 0-1.12-1.12l-3.3-1.08 10.62-4.25z" />
          </svg>
        </button>
      </form>
      {uploadError ? <p className="post-caption">{uploadError}</p> : null}
    </section>
  )
}

export default UploadPage
