// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.8.4;

contract Decentragram {
    string public name = "Decentragram";

    // Store Image
    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 tipAmount;
        address author;
    }

    event ImageCreated(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address author
    );

    event ImageTipped(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address author
    );

    uint256 public imageCount = 0;
    mapping(uint256 => Image) public images;

    // Create Image
    function uploadImage(string memory _hashKey, string memory _description)
        public
    {
        require(
            bytes(_hashKey).length > 0,
            "Image can't be upload without hash"
        );
        require(
            bytes(_description).length > 0,
            "Image can't be upload without description"
        );

        require(
            msg.sender != address(0x0),
            "Image must be uploaded by a valid address"
        );
        imageCount++;
        images[imageCount] = Image(
            imageCount,
            _hashKey,
            _description,
            0,
            msg.sender
        );

        emit ImageCreated(imageCount, _hashKey, _description, 0, msg.sender);
    }

    // Tip Image
    function tipImageOwner(uint256 _imageId) public payable {

        require(
            _imageId > 0 && _imageId <= imageCount,
            "Image id should be valid"
        );

        // Fetch Image according to Image Id
        Image memory _image = images[_imageId];
        // Fetch the author of the Image
        address author = _image.author;
        // Transfer the tip amount to author
        payable(author).transfer(msg.value);
        // Update the tip amount
        _image.tipAmount = _image.tipAmount + msg.value;
        // Put back the updated image
        images[_imageId] = _image;
        // Trigger Event
        emit ImageTipped(
            _imageId,
            _image.hash,
            _image.description,
            _image.tipAmount,
            author
        );
    }
}
