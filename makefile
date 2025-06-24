help: ; @cat ./makefile
ssh: ; ssh -p 21098 -o HostKeyAlgorithms=+ssh-rsa -o \
PubkeyAcceptedAlgorithms=+ssh-rsa wyncbqna@wynchar.com
upload up: ; rsync -CPazv --copy-links -e "ssh -p 21098" \
	--exclude ".git" --exclude "node_modules" ./ \
	wyncbqna@wynchar.com:public_html/gaps
checkpoint cp: ; git st; git commit -am"checkpoint"
st: ; git st
diff: ; git diff
sizes: ; wc lib/*.dart | sort -n
